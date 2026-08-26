/**
 * Remark plugin to transform [document-embed ...] shortcodes in Markdown.
 * This runs at the MDAST level, before rehype, so it works with
 * Astro Content Collections' render() API.
 */
import { visit, SKIP } from 'unist-util-visit';

const SITE_URL = 'https://kolumbia17.vercel.app';

const DOCUMENT_EXTENSIONS = ['.xlsx', '.xls', '.ods', '.csv', '.docx', '.doc', '.odt', '.pdf', '.pptx', '.ppt', '.odp'];

function isDocumentFile(src) {
  if (!src) return false;
  const lower = src.toLowerCase().split('?')[0];
  return DOCUMENT_EXTENSIONS.some(ext => lower.endsWith(ext));
}

function getDocType(src) {
  const lower = src.toLowerCase().split('?')[0];
  if (['.xlsx', '.xls', '.ods', '.csv'].some(e => lower.endsWith(e))) return 'excel';
  if (['.docx', '.doc', '.odt'].some(e => lower.endsWith(e))) return 'word';
  if (lower.endsWith('.pdf')) return 'pdf';
  if (['.pptx', '.ppt', '.odp'].some(e => lower.endsWith(e))) return 'powerpoint';
  return 'document';
}

function getDocLabel(docType) {
  const labels = {
    excel: 'Excel táblázat',
    word: 'Word dokumentum',
    pdf: 'PDF dokumentum',
    powerpoint: 'PowerPoint bemutató',
    document: 'Dokumentum'
  };
  return labels[docType] || 'Dokumentum';
}

function buildEmbedHtml(src, title, siteUrl) {
  const docType = getDocType(src);
  const label = getDocLabel(docType);
  const absoluteSrc = src.startsWith('http') ? src : `${siteUrl}${src}`;

  let iframeSrc = '';
  if (docType === 'pdf') {
    iframeSrc = absoluteSrc;
  } else if (docType !== 'document') {
    iframeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteSrc)}`;
  }

  const displayTitle = title || decodeURIComponent(src.split('/').pop() || src);

  const downloadIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
  const viewIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon icon-view"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  const closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon icon-close"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  const openLinkIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;

  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h8M8 17h8M12 13v8"></path></svg>`;

  const previewUrl = iframeSrc || absoluteSrc;
  const toggleJs = `const w=this.closest('.embedded-doc-wrapper');if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){const u=w?.getAttribute('data-preview-url');if(u){window.open(u,'_blank','noopener,noreferrer');return;}}const c=w?.querySelector('.embedded-doc-frame-container');const t=w?.querySelector('.preview-btn-text');if(c&&c.hasAttribute('hidden')){c.removeAttribute('hidden');if(t)t.textContent='Bezárás';w.classList.add('is-preview-open');}else if(c){c.setAttribute('hidden','');if(t)t.textContent='Megtekintés';w.classList.remove('is-preview-open');}`;

  let titleHtml = `<span class="embedded-doc-title">${displayTitle}</span>`;
  let actionsHtml = '';
  if (iframeSrc) {
    titleHtml = `<button type="button" class="embedded-doc-title embedded-doc-title-btn" title="Kattints az előnézethez" onclick="${toggleJs}">${displayTitle}</button>`;
    actionsHtml += `<button type="button" class="embedded-doc-btn btn-open" title="Dokumentum előnézete" onclick="${toggleJs}">${viewIcon}${closeIcon}<span class="preview-btn-text">Megtekintés</span></button>`;
  } else {
    actionsHtml += `<a href="${absoluteSrc}" target="_blank" rel="noopener noreferrer" class="embedded-doc-btn btn-open" title="Megnyitás új lapon">${openLinkIcon}<span>Megnyitás</span></a>`;
  }
  actionsHtml += `<a href="${src}" download class="embedded-doc-btn btn-download" title="Dokumentum letöltése">${downloadIcon}<span>Letöltés</span></a>`;

  return `<div class="embedded-doc-wrapper doc-type-${docType}" data-src="${src}" data-preview-url="${previewUrl}" data-doc-type="${docType}"><div class="embedded-doc-header"><div class="embedded-doc-info"><span class="embedded-doc-icon-badge ${docType}">${iconSvg}</span><div class="embedded-doc-text">${titleHtml}<span class="embedded-doc-badge">${label}</span></div></div><div class="embedded-doc-actions">${actionsHtml}</div></div>${iframeSrc ? `<div class="embedded-doc-frame-container" hidden><iframe src="${iframeSrc}" class="embedded-doc-iframe" loading="lazy" title="${displayTitle}" frameborder="0" allowfullscreen></iframe></div>` : ''}</div>`;
}

// Shortcode regex: handles straight and smart (typographic) quotes
const SHORTCODE_RE = /\[document-embed\s+src=["'\u201c\u201d\u2018\u2019]([^"'\u201c\u201d\u2018\u2019]+)["'\u201c\u201d\u2018\u2019](?:\s+title=["'\u201c\u201d\u2018\u2019]([^"'\u201c\u201d\u2018\u2019]*)["'\u201c\u201d\u2018\u2019])?\]/i;

export default function remarkDocumentEmbed(options = {}) {
  const siteUrl = (options && options.site) || SITE_URL;

  return function (tree) {
    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || index === null) return;

      // 1. Paragraph containing only a shortcode text node
      if (node.children.length === 1 && node.children[0].type === 'text') {
        const text = node.children[0].value.trim();
        const match = text.match(SHORTCODE_RE);
        if (match) {
          const src = match[1];
          const title = match[2] || '';
          parent.children[index] = { type: 'html', value: buildEmbedHtml(src, title, siteUrl) };
          return [SKIP, index];
        }
      }

      // 2. Paragraph with a single link pointing to a document file
      if (node.children.length === 1 && node.children[0].type === 'link') {
        const link = node.children[0];
        if (isDocumentFile(link.url)) {
          const title = link.children.map(c => c.value || '').join('').trim();
          parent.children[index] = { type: 'html', value: buildEmbedHtml(link.url, title, siteUrl) };
          return [SKIP, index];
        }
      }

      // 3. Paragraph with a single image pointing to a document file (safety net)
      if (node.children.length === 1 && node.children[0].type === 'image') {
        const img = node.children[0];
        if (isDocumentFile(img.url)) {
          parent.children[index] = { type: 'html', value: buildEmbedHtml(img.url, img.alt || '', siteUrl) };
          return [SKIP, index];
        }
      }
    });
  };
}
