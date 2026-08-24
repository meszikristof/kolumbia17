/**
 * Custom Rehype plugin for Astro to intelligently embed documents (Excel, Word, PowerPoint, PDF)
 * when uploaded in Markdown, preventing broken images and providing interactive viewers.
 */

function getDocTypeInfo(src) {
  if (!src || typeof src !== 'string') return null;
  const cleanPath = src.split('?')[0].split('#')[0].toLowerCase();

  if (cleanPath.endsWith('.xlsx') || cleanPath.endsWith('.xls') || cleanPath.endsWith('.csv') || cleanPath.endsWith('.ods')) {
    return {
      type: 'excel',
      label: 'Excel táblázat',
      isOffice: true
    };
  }
  if (cleanPath.endsWith('.docx') || cleanPath.endsWith('.doc') || cleanPath.endsWith('.odt') || cleanPath.endsWith('.rtf')) {
    return {
      type: 'word',
      label: 'Word dokumentum',
      isOffice: true
    };
  }
  if (cleanPath.endsWith('.pptx') || cleanPath.endsWith('.ppt') || cleanPath.endsWith('.odp')) {
    return {
      type: 'powerpoint',
      label: 'Prezentáció',
      isOffice: true
    };
  }
  if (cleanPath.endsWith('.pdf')) {
    return {
      type: 'pdf',
      label: 'PDF dokumentum',
      isOffice: false
    };
  }
  return null;
}

function isDocumentFile(src) {
  return getDocTypeInfo(src) !== null;
}

function getDisplayTitle(src, customTitle) {
  if (customTitle && typeof customTitle === 'string' && customTitle.trim().length > 0 && customTitle.trim() !== '_:_') {
    return customTitle.trim();
  }
  try {
    const rawFilename = src.split('/').pop().split('?')[0].split('#')[0];
    return decodeURIComponent(rawFilename);
  } catch (e) {
    return src.split('/').pop() || 'Dokumentum';
  }
}

function getTextContent(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (Array.isArray(node.children)) {
    return node.children.map(getTextContent).join('');
  }
  return '';
}

function getIconAst(type) {
  if (type === 'excel') {
    return {
      type: 'element',
      tagName: 'svg',
      properties: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '22',
        height: '22',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      children: [
        {
          type: 'element',
          tagName: 'path',
          properties: { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }
        },
        {
          type: 'element',
          tagName: 'polyline',
          properties: { points: '14 2 14 8 20 8' }
        },
        {
          type: 'element',
          tagName: 'path',
          properties: { d: 'M8 13h8M8 17h8M12 13v8' }
        }
      ]
    };
  } else if (type === 'pdf') {
    return {
      type: 'element',
      tagName: 'svg',
      properties: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '22',
        height: '22',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      children: [
        {
          type: 'element',
          tagName: 'path',
          properties: { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }
        },
        {
          type: 'element',
          tagName: 'polyline',
          properties: { points: '14 2 14 8 20 8' }
        },
        {
          type: 'element',
          tagName: 'path',
          properties: { d: 'M9 15v-6h2a2 2 0 0 1 0 4H9' }
        }
      ]
    };
  } else {
    // Word / Generic doc
    return {
      type: 'element',
      tagName: 'svg',
      properties: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '22',
        height: '22',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      },
      children: [
        {
          type: 'element',
          tagName: 'path',
          properties: { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }
        },
        {
          type: 'element',
          tagName: 'polyline',
          properties: { points: '14 2 14 8 20 8' }
        },
        {
          type: 'element',
          tagName: 'line',
          properties: { x1: '16', y1: '13', x2: '8', y2: '13' }
        },
        {
          type: 'element',
          tagName: 'line',
          properties: { x1: '16', y1: '17', x2: '8', y2: '17' }
        }
      ]
    };
  }
}

function getDownloadIconAst() {
  return {
    type: 'element',
    tagName: 'svg',
    properties: {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      width: '16',
      height: '16',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
    children: [
      {
        type: 'element',
        tagName: 'path',
        properties: { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }
      },
      {
        type: 'element',
        tagName: 'polyline',
        properties: { points: '7 10 12 15 17 10' }
      },
      {
        type: 'element',
        tagName: 'line',
        properties: { x1: '12', y1: '15', x2: '12', y2: '3' }
      }
    ]
  };
}

function getOpenIconAst() {
  return {
    type: 'element',
    tagName: 'svg',
    properties: {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      width: '16',
      height: '16',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
    children: [
      {
        type: 'element',
        tagName: 'path',
        properties: { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }
      },
      {
        type: 'element',
        tagName: 'polyline',
        properties: { points: '15 3 21 3 21 9' }
      },
      {
        type: 'element',
        tagName: 'line',
        properties: { x1: '10', y1: '14', x2: '21', y2: '3' }
      }
    ]
  };
}

function createDocumentNode(src, customTitle, siteUrl) {
  const docInfo = getDocTypeInfo(src);
  if (!docInfo) return null;

  const displayTitle = getDisplayTitle(src, customTitle);
  const baseUrl = (siteUrl || 'https://kolumbia17.vercel.app').replace(/\/$/, '');
  const fullUrl = src.startsWith('http://') || src.startsWith('https://')
    ? src
    : `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`;

  // For Office files use Microsoft Office Web Viewer, for PDF use native browser URL
  const embedUrl = docInfo.isOffice
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`
    : src;

  return {
    type: 'element',
    tagName: 'div',
    properties: {
      className: ['embedded-doc-wrapper', `doc-type-${docInfo.type}`],
      dataSrc: src,
      dataDocType: docInfo.type
    },
    children: [
      {
        type: 'element',
        tagName: 'div',
        properties: { className: ['embedded-doc-header'] },
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['embedded-doc-info'] },
            children: [
              {
                type: 'element',
                tagName: 'span',
                properties: { className: ['embedded-doc-icon-badge', docInfo.type] },
                children: [getIconAst(docInfo.type)]
              },
              {
                type: 'element',
                tagName: 'div',
                properties: { className: ['embedded-doc-text'] },
                children: [
                  {
                    type: 'element',
                    tagName: 'span',
                    properties: { className: ['embedded-doc-title'] },
                    children: [{ type: 'text', value: displayTitle }]
                  },
                  {
                    type: 'element',
                    tagName: 'span',
                    properties: { className: ['embedded-doc-badge'] },
                    children: [{ type: 'text', value: docInfo.label }]
                  }
                ]
              }
            ]
          },
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['embedded-doc-actions'] },
            children: [
              {
                type: 'element',
                tagName: 'a',
                properties: {
                  href: src,
                  download: true,
                  className: ['embedded-doc-btn', 'btn-download'],
                  title: 'Dokumentum letöltése'
                },
                children: [
                  getDownloadIconAst(),
                  {
                    type: 'element',
                    tagName: 'span',
                    children: [{ type: 'text', value: 'Letöltés' }]
                  }
                ]
              },
              {
                type: 'element',
                tagName: 'a',
                properties: {
                  href: fullUrl,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className: ['embedded-doc-btn', 'btn-open'],
                  title: 'Megnyitás teljes méretben'
                },
                children: [
                  getOpenIconAst(),
                  {
                    type: 'element',
                    tagName: 'span',
                    children: [{ type: 'text', value: 'Megnyitás' }]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        type: 'element',
        tagName: 'div',
        properties: { className: ['embedded-doc-frame-container'] },
        children: [
          {
            type: 'element',
            tagName: 'iframe',
            properties: {
              src: embedUrl,
              className: ['embedded-doc-iframe'],
              loading: 'lazy',
              title: displayTitle,
              frameBorder: '0',
              allowFullScreen: true
            },
            children: []
          }
        ]
      }
    ]
  };
}

export default function rehypeDocumentEmbed(options = {}) {
  const siteUrl = options.site || 'https://kolumbia17.vercel.app';

  return function (tree) {
    function transform(parent) {
      if (!parent || !Array.isArray(parent.children)) return;

      for (let i = 0; i < parent.children.length; i++) {
        const child = parent.children[i];

        // 1. Check if child is paragraph
        if (child.type === 'element' && child.tagName === 'p') {
          // Check for shortcode [document-embed src="..." title="..."]
          const textContent = getTextContent(child).trim();
          const shortcodeMatch = textContent.match(/^\[document-embed\s+src=["']([^"']+)["'](?:\s+title=["']([^"']*)["'])?\]$/i);

          if (shortcodeMatch) {
            const src = shortcodeMatch[1];
            const title = shortcodeMatch[2] || '';
            const docNode = createDocumentNode(src, title, siteUrl);
            if (docNode) {
              parent.children[i] = docNode;
              continue;
            }
          }

          // Check if paragraph contains an img with document extension
          const imgChildren = child.children.filter(c => c.type === 'element' && c.tagName === 'img');
          const otherMeaningfulChildren = child.children.filter(c =>
            (c.type === 'text' && c.value.trim().length > 0) ||
            (c.type === 'element' && c.tagName !== 'img')
          );

          if (imgChildren.length === 1 && otherMeaningfulChildren.length === 0) {
            const img = imgChildren[0];
            const src = img.properties && img.properties.src;
            if (isDocumentFile(src)) {
              const title = (img.properties && (img.properties.alt || img.properties.title)) || '';
              const docNode = createDocumentNode(src, title, siteUrl);
              if (docNode) {
                parent.children[i] = docNode;
                continue;
              }
            }
          }
        }

        // 2. Direct img element in tree with document extension
        if (child.type === 'element' && child.tagName === 'img') {
          const src = child.properties && child.properties.src;
          if (isDocumentFile(src)) {
            const title = (child.properties && (child.properties.alt || child.properties.title)) || '';
            const docNode = createDocumentNode(src, title, siteUrl);
            if (docNode) {
              parent.children[i] = docNode;
              continue;
            }
          }
        }

        // 3. Direct a (link) element in tree with document extension
        if (child.type === 'element' && child.tagName === 'a') {
          const href = child.properties && child.properties.href;
          if (isDocumentFile(href)) {
            const title = getTextContent(child).trim();
            const docNode = createDocumentNode(href, title, siteUrl);
            if (docNode) {
              parent.children[i] = docNode;
              continue;
            }
          }
        }

        // Recursively process child
        transform(child);
      }
    }

    transform(tree);
  };
}
