class DocEditor {
    constructor(editorId) {
        this.contentArea = document.getElementById(editorId);
        this.contentArea.focus();
        this.activeWrapper = null;
        this.modal = document.getElementById('modal');

    
        this.imageInput = document.getElementById('image-upload');
        this.imageInput.addEventListener('change', this.handleImageUpload.bind(this));
        this.contentArea.addEventListener('input', this.autoSave.bind(this));
        this.contentArea.addEventListener('click', this.handleEditorClick.bind(this));

        
        this.loadFromLocalStorage();
    }

    
    formatText(command, value = null) {
        document.execCommand(command, false, value);
        this.contentArea.focus();
    }

    changeSize(size) {
        if (size) this.formatText('fontSize', size);
    }

    changeFont(font) {
        if (font) this.formatText('fontName', font);
    }

    align(type) {
        this.formatText(`justify${type.charAt(0).toUpperCase() + type.slice(1)}`);
    }

    colorText(color) {
        this.formatText('foreColor', color);
    }

    highlightText(color) {
        this.formatText('hiliteColor', color);
    }


    openModal(type) {
        const modalBody = document.getElementById('modal-body');
        switch (type) {
            case 'link':
                modalBody.innerHTML = '<label>Link URL:</label><input type="text" id="modal-input" placeholder="https://example.com">';
                break;
            case 'image':
                modalBody.innerHTML = '<label>Image URL:</label><input type="text" id="modal-input" placeholder="https://example.com/image.jpg">';
                break;
            case 'table':
                modalBody.innerHTML = '<label>Rows:</label><input type="number" id="modal-rows" min="1"><label>Columns:</label><input type="number" id="modal-cols" min="1">';
                break;
            case 'findReplace':
                modalBody.innerHTML = '<label>Find:</label><input type="text" id="find-text"><label>Replace:</label><input type="text" id="replace-text">';
                break;
        }
        this.modal.style.display = 'block';
        this.modalType = type;
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.getElementById('modal-body').innerHTML = '';
    }

    submitModal() {
        const modalBody = document.getElementById('modal-body');
        switch (this.modalType) {
            case 'link':
                const linkUrl = document.getElementById('modal-input').value;
                if (linkUrl && /^(https?:\/\/|www\.)/.test(linkUrl)) {
                    this.formatText('createLink', linkUrl);
                    this.showNotification('Link inserted!');
                } else if (linkUrl) {
                    this.showNotification('Please enter a valid URL (e.g., http:// or https://).');
                } else {
                    this.showNotification('No URL entered.');
                }
                break;

            case 'image':
                const url = document.getElementById('modal-input').value;
                if (url && /\.(jpg|jpeg|png|gif)$/i.test(url)) {
                    this.insertImage(url);
                    this.showNotification('Image inserted!');
                } else if (url) {
                    this.showNotification('Please enter a valid image URL (e.g., .jpg, .png, .gif).');
                } else {
                    this.showNotification('No image URL entered.');
                }
                break;

            case 'table':
                const rows = parseInt(document.getElementById('modal-rows').value) || 2;
                const cols = parseInt(document.getElementById('modal-cols').value) || 2;
                if (rows > 0 && cols > 0) {
                    const tableHtml = this.createTableHtml(rows, cols);
                    this.insertContent(tableHtml);
                    this.showNotification('Table inserted!');
                } else {
                    this.showNotification('Please enter valid numbers for rows and columns.');
                }
                break;

            case 'findReplace':
                const findText = document.getElementById('find-text').value;
                const replaceText = document.getElementById('replace-text').value;
                if (findText && replaceText) {
                    const content = this.getEditorContent();
                    const newContent = content.replace(new RegExp(findText, 'g'), replaceText);
                    this.contentArea.innerHTML = newContent;
                    this.showNotification('Text replaced!');
                } else {
                    this.showNotification('Please enter both find and replace text.');
                }
                break;
        }
        this.closeModal();
    }


    insertLocalImage() {
        this.imageInput.value = '';
        this.imageInput.click();
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            this.showNotification('No image selected.');
            return;
        }
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image (jpg, png, gif).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('Image too large! Use under 5MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            this.insertImage(e.target.result);
            this.showNotification('Image uploaded!');
            this.contentArea.focus();
        };
        reader.onerror = () => this.showNotification('Error reading image file.');
        reader.readAsDataURL(file);
    }

    insertImage(src) {
        const html = `<div class="resizeable-container"><img src="${src}" style="max-width: 100%; height: auto;" class="resizable-img"></div>`;
        this.insertContent(html);
    }


    createTableHtml(rows, cols) {
        let table = '<table border="1" style="border-collapse: collapse; margin: 10px 0; width: 80%;">';
        for (let r = 0; r < rows; r++) {
            table += '<tr>';
            for (let c = 0; c < cols; c++) {
                table += '<td style="padding: 8px; min-width: 80px; text-align: center;">Cell</td>';
            }
            table += '</tr>';
        }
        table += '</table>';
        return `<div class="resizeable-container">${table}</div>`;
    }

    insertContent(html) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(this.createFragmentFromHtml(html));
        } else {
            this.contentArea.insertAdjacentHTML('beforeend', html);
        }
        this.contentArea.focus();
    }

    createFragmentFromHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        const fragment = document.createDocumentFragment();
        while (div.firstChild) {
            fragment.appendChild(div.firstChild);
        }
        return fragment;
    }
    clearContent() {
        if (confirm('Clear all content? This cannot be undone.')) {
            this.contentArea.innerHTML = '<div class="page" data-page="1"></div>';
            this.showNotification('Content cleared!');
            this.contentArea.focus();
        }
    }

    getEditorContent() {
        return this.contentArea.innerHTML;
    }

    toggleMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('mode', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        this.showNotification('Theme toggled!');
    }

    copyPlainText() {
        navigator.clipboard.writeText(this.contentArea.innerText)
            .then(() => this.showNotification('Copied plain text!'))
            .catch(() => this.showNotification('Failed to copy plain text.'));
    }

    copyHTML() {
        navigator.clipboard.writeText(this.getEditorContent())
            .then(() => this.showNotification('Copied HTML!'))
            .catch(() => this.showNotification('Failed to copy HTML.'));
    }

    autoSave() {
        localStorage.setItem('editorContent', this.getEditorContent());
        
    }

    indent() {
        this.formatText('indent');
    }

    outdent() {
        this.formatText('outdent');
    }

    previewContent() {
        const previewDiv = document.createElement('div');
        previewDiv.id = 'preview';
        previewDiv.innerHTML = this.getEditorContent();
        previewDiv.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); color: #fff; padding: 20px; overflow: auto; z-index: 9999; box-sizing: border-box;';
        previewDiv.addEventListener('click', () => previewDiv.remove());
        document.body.appendChild(previewDiv);
        this.showNotification('Preview opened!');
    }

    findAndReplace() {
        this.openModal('findReplace');
    }

    handleEditorClick(event) {
        const wrapper = event.target.closest('.resizeable-container');
        if (wrapper) {
            if (this.activeWrapper) this.removeResizeHandle(this.activeWrapper);
            this.activeWrapper = wrapper;
            this.addResizeHandle(wrapper);
            wrapper.classList.add('selected');
        } else if (this.activeWrapper) {
            this.removeResizeHandle(this.activeWrapper);
            this.activeWrapper.classList.remove('selected');
            this.activeWrapper = null;
        }
    }

    addResizeHandle(wrapper) {
        if (!wrapper.querySelector('.resize-handle')) {
            const handle = document.createElement('div');
            handle.className = 'resize-handle';
            wrapper.appendChild(handle);
            handle.addEventListener('mousedown', this.startResize.bind(this));
        }
    }

    removeResizeHandle(wrapper) {
        const handle = wrapper.querySelector('.resize-handle');
        if (handle) {
            handle.removeEventListener('mousedown', this.startResize.bind(this));
            handle.remove();
        }
    }

    startResize(e) {
        e.preventDefault();
        const img = this.activeWrapper.querySelector('img, table');
        if (!img) return;

        let startX = e.clientX;
        let startY = e.clientY;
        let startWidth = img.offsetWidth;
        let startHeight = img.offsetHeight;
        let aspectRatio = startWidth / startHeight;

        function onMouseMove(event) {
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;
            let newWidth = startWidth + dx;
            let newHeight = newWidth / aspectRatio;
            newWidth = Math.max(50, Math.min(newWidth, 800));
            newHeight = newWidth / aspectRatio;
            img.style.width = `${newWidth}px`;
            img.style.height = `${newHeight}px`;
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    loadFromLocalStorage() {
        const content = localStorage.getItem('editorContent');
        if (content) this.contentArea.innerHTML = content;
        if (localStorage.getItem('mode') === 'dark') document.body.classList.add('dark-mode');
    }

    showNotification(message) {
        const container = document.getElementById('notification-container');
        const note = document.createElement('div');
        note.textContent = message;
        note.className = 'notification';
        container.appendChild(note);

        setTimeout(() => note.classList.add('show'), 10);
        setTimeout(() => {
            note.classList.remove('show');
            setTimeout(() => note.remove(), 300);
        }, 3000);
    }
}

class DocExporter {
    constructor(editor) {
        this.editor = editor;
    }

    getDocInfo() {
        return {
            title: document.getElementById('document-title').value.trim() || 'Untitled',
            author: document.getElementById('document-author').value.trim() || 'Anonymous'
        };
    }

    exportPdf() {
        const { title, author } = this.getDocInfo();
        const div = document.createElement('div');
        div.style.margin = div.style.padding = 0;
        const font = window.getComputedStyle(document.querySelector('#content-editor .page')).fontFamily || window.getComputedStyle(document.body).fontFamily;
        div.style.fontFamily = font;

        div.innerHTML = `<h1 style="font-family:${font}; color:#2c3e50;">${title}</h1>
            <p style="font-size:12px; color:#7f8c8d;">By ${author}</p>
            <hr style="border:0.5px solid #e0e0e0; margin:5px 0;">
            ${this.editor.getEditorContent().replace(/<img /g, '<img style="max-width:100%; height:auto;" ')}`;

        html2pdf().from(div).set({
            margin: [0.5, 0.5, 1.2, 0.5],
            filename: `${title}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }).toPdf().get('pdf').then(pdf => {
            for (let i = 1; i <= pdf.internal.getNumberOfPages(); i++) {
                pdf.setPage(i);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(10);
                pdf.setTextColor(120, 120, 120);
                pdf.text(`Page ${i} of ${pdf.internal.getNumberOfPages()}`, pdf.internal.pageSize.getWidth() - 1.2, pdf.internal.pageSize.getHeight() - 0.4, { align: 'right' });
            }
            this.editor.showNotification('PDF exported!');
        }).save();
    }

    exportDoc() {
        const { title, author } = this.getDocInfo();
        const font = window.getComputedStyle(document.querySelector('#content-editor .page')).fontFamily || window.getComputedStyle(document.body).fontFamily;
        const content = `
            <!DOCTYPE html><html><head><meta charset="utf-8"></head>
            <body style="margin:0; padding:0; font-family:${font};">
                <h1>${title}</h1>
                <p style="font-size:12px;">Author: ${author}</p>
                <hr style="border:0.5px solid #e0e0e0; margin:5px 0;">
                ${this.editor.getEditorContent().replace(/<img /g, '<img style="max-width:100%; height:auto;" ')}
            </body></html>
        `;
        const blob = htmlDocx.asBlob(content);
        saveAs(blob, `${title}.docx`);
        this.editor.showNotification('DOC exported!');
    }
}

const docEditor = new DocEditor('content-editor');
const docExporter = new DocExporter(docEditor);