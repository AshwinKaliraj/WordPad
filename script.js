class DocEditor{
    constructor(editorId){
        this.contentArea=document.getElementById(editorId);
        this.contentArea.focus(); 
        this.activeWrapper=null; 
        
        this.imageInput=document.getElementById('image-upload');
        this.imageInput.addEventListener('change',this.handleImageUpload.bind(this));
        this.contentArea.addEventListener('input', this.autoSave.bind(this));
        
        this.contentArea.addEventListener('click',this.handleEditorClick.bind(this));
        this.loadFromLocalStorage();
    }
    formatText(cmd,val=null){
        document.execCommand(cmd,false,val);
        this.contentArea.focus();
    }
    changeSize(size){
        if(size){
            this.formatText('fontSize',size);
        }
    }

    changeFont(font){
        if(font){
            this.formatText('fontName',font);
        }
    }

    align(type){
        this.formatText(`justify${type.charAt(0).toUpperCase()+type.slice(1)}`);
    }


    colorText(color){
        this.formatText('foreColor',color);
    }

    highlightText(color){
        this.formatText('hiliteColor',color);
    }

    insertHyperlink(){
        const linkUrl=prompt('Enter link URL(e.g., https://example.com):');
        if(linkUrl&&linkUrl.match(/^(https?:\/\/|www\.)/)){
            this.formatText('createLink',linkUrl);
        }else if(linkUrl){
            alert('Please use a valid URL (http:// or https://).');
        }
    }

    insertLocalImage(){
        this.imageInput.value=''; 
        this.imageInput.click();
    }

    insertImageUrl(){
        const url=prompt('Enter image URL (e.g., https://example.com/image.jpg):');
        if(url && url.match(/\.(jpg|jpeg|png|gif)$/i)) {
            this.insertResizableImage(url);
        }else if(url){
            alert('Please enter a valid image URL (jpg, png, or gif).');
        }
        const html=`<div class="resizeable-container">${table}</div><br/>`;
    }

      handleImageUpload(event){
        const file=event.target.files[0];
        if(!file){
            alert('No image selected.Please choose a file.');
            return;
        }
        if(!file.type.startsWith('image/')){
            alert('Please select a valid image (jpg, png, gif).');
            return;
        }
        if(file.size>5*1024*1024){ 
            alert('Image too large!Please use a file under 5MB.');
            return;
        }
        const reader=new FileReader();
        reader.onload=(e)=>{
            try{
                this.insertResizableImage(e.target.result);
                this.contentArea.focus();
            }catch(err){
                alert('Failed to insert image.Try again.');
                console.error('Image insert error:',err);
            }
        };
        reader.onerror=()=>{
            alert('Error reading image file.Try another.');
        };
        reader.readAsDataURL(file);
        
    }
insertResizableImage(src){
    const wrapperHtml = `
        <div class="image-wrapper resizeable-container">
            <img src="${src}" class="resizable-img">
        </div>`;
    this.formatText('insertHTML', wrapperHtml);
}


    // insertGrid(){
        // const numRows=parseInt(prompt('Number of rows:'),10);
        // const numCols=parseInt(prompt('Number of columns:'),10);
        // if(isNaN(numRows)||isNaN(numCols)||numRows<1||numCols<1){
        //     alert('Please enter valid numbers for rows and columns.');
        //     return;
        // }
        // let tableCode='<table border="1" style="width:100%; border-collapse:collapse; border-color:#ccc;">';
        // for(let row=0;row<numRows;row++){
        //     tableCode+='<tr>';
        //     for(let col=0;col<numCols;col++){
        //         tableCode+='<td contenteditable="true">&nbsp;</td>';
        //     }
        //     tableCode+='</tr>';
        // }
        // tableCode+='</table>';
        // this.formatText('insertHTML',tableCode);
 insertGrid(){
        const rows = prompt("Enter number of rows:", 2);
        const cols = prompt("Enter number of columns:", 2);
        if (rows > 0 && cols > 0) {
            let table = "<table border='1' style='border-collapse:collapse; margin:10px 0; table-layout:fixed; width:80%;'>"; // Fixed layout and 80% width
            for (let r = 0; r < rows; r++) {
                table += "<tr>";
                for (let c = 0; c < cols; c++) {
                    table += "<td style='padding:8px; min-width:80px; text-align:center; word-break:break-all;'>Cell</td>"; // break-all to prevent expansion
                }
                table += "</tr>";
            }
            table += "</table>";
            const html=`<div class="resizeable-container">${table}</div><br/>`;
            this.formatText('insertHTML', html); // Insert table
        }
    }
    

 clearContent(){
        if(confirm('Clear all content? This cannot be undone.')){
            this.contentArea.innerHTML='';
            this.contentArea.focus();
        }
    }
     getEditorContent(){
        return this.contentArea.innerHTML;
    }
    toggleMode(){
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('mode',document.body.classList.contains('dark-mode')?'dark':'light');
    }
    copyPlainText() {
        const text = this.contentArea.innerText; 
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied plain text!');
        }).catch(() => {
            alert('Failed to copy plain text.');
        });
    }

    copyHTML() {
        const html = this.getEditorContent(); 
        navigator.clipboard.writeText(html).then(() => {
            alert('Copied HTML!');
        }).catch(() => {
            alert('Failed to copy HTML.');
        });
    }
    autoSave(){
        localStorage.setItem('editorContent',this.getEditorContent());
    }
    
    indent(){
        this.formatText('indent');
    }

    outdent(){
        this.formatText('outdent');
    }
    previewContent(){
        const previewDiv=document.createElement('div');
        previewDiv.id='preview';
        previewDiv.innerHTML=this.getEditorContent();
        previewDiv.style.position='fixed';
        previewDiv.style.top='0';
        previewDiv.style.left='0';
        previewDiv.style.width='100%';
        previewDiv.style.height='100%';
        previewDiv.style.background='rgba(0,0,0,0.8)';
        previewDiv.style.color='#fff';
        previewDiv.style.padding='20px';
        previewDiv.style.overflow='auto';
        previewDiv.style.zIndex='9999';
        previewDiv.style.boxSizing='border-box';
        previewDiv.addEventListener('click',()=>previewDiv.remove()); 
        document.body.appendChild(previewDiv);
    }
    findAndReplace(){
        const findText= prompt('Enter text to find:');
        const replaceText=prompt('Enter replacement text:');
        if(findText&&replaceText){
            const content=this.getEditorContent();
            const newContent=content.replace(new RegExp(findText,'g'),replaceText);
            this.contentArea.innerHTML=newContent;
        }
    }
    handleEditorClick(event){
        const wrapper=event.target.closest('.image-wrapper, .table-wrapper');
        if(wrapper){
            if(this.activeWrapper){
                this.removeResizeHandle(this.activeWrapper);
            }
            this.activeWrapper=wrapper;
            this.addResizeHandle(wrapper);
            wrapper.classList.add('selected');
        }else if(this.activeWrapper){
            this.removeResizeHandle(this.activeWrapper);
            this.activeWrapper.classList.remove('selected');
            this.activeWrapper=null;
        }
    }

    addResizeHandle(wrapper){
        if(!wrapper.querySelector('.resize-handle')){
            const handle=document.createElement('div');
            handle.className='resize-handle';
            wrapper.appendChild(handle);
            handle.addEventListener('mousedown',this.startResize.bind(this));
        }
    }

    removeResizeHandle(wrapper){
        const handle=wrapper.querySelector('.resize-handle');
        if (handle){
            handle.removeEventListener('mousedown',this.startResize.bind(this));
            handle.remove();
        }
    }

        startResize(e){
        e.preventDefault();
        const img=this.activeWrapper.querySelector('img');
        if(!img)return;
        
        let startX=e.clientX;
        let startY=e.clientY;
        let startWidth=img.offsetWidth;
        let startHeight=img.offsetHeight;
        let aspectRatio=startWidth/startHeight;

        const onMouseMove=(e)=>{
            const dx=e.clientX-startX;
            const dy=e.clientY-startY;
            let newWidth=startWidth+dx;
            let newHeight=newWidth/aspectRatio;
              newWidth=Math.max(50,Math.min(newWidth,800));
              newHeight=newWidth/aspectRatio;
                img.style.width=`${newWidth}px`;
                img.style.height=`${newHeight}px`;
            
        };

        const onMouseUp=()=>{
            document.removeEventListener('mousemove',onMouseMove);
            document.removeEventListener('mouseup',onMouseUp);
        };

        document.addEventListener('mousemove',onMouseMove);
        document.addEventListener('mouseup',onMouseUp);
    }
    loadFromLocalStorage() {
        const savedContent = localStorage.getItem('editorContent');
        if (savedContent) {
            this.contentArea.innerHTML = savedContent;
        }
        const mode = localStorage.getItem('mode');
        if (mode==='dark') {
            document.body.classList.add('dark-mode');
        }
    }
}

class DocExporter{
    constructor(editorInstance){
        this.editor=editorInstance;
    }

    getDocInfo(){
        const title=document.getElementById('document-title').value.trim()||'Untitled';
        const author=document.getElementById('document-author').value.trim()||'Anonymous';
        return{title,author};
    }

    exportPdf(){
        const{title,author}=this.getDocInfo();
        const exportDiv=document.createElement('div');
        exportDiv.innerHTML=`<h1 style="font-family:Arial,sans-serif;color:#2c3e50">${title}</h1>
            <p style="font-size:12px;color:#7f8c8d">By ${author}</p>
            <hr style="border:0.5px solid #e0e0e0">
            ${this.editor.getEditorContent()}
        `;
        
        const pdfOptions={
            margin:[0.5,0.5,1.2,0.5], 
            filename:`${title}.pdf`,
            image:{type:'jpeg',quality:0.98},
            html2canvas:{scale:2},
            jsPDF:{unit:'in',format:'letter',orientation:'portrait'}
        };
        
        html2pdf().from(exportDiv).set(pdfOptions).toPdf().get('pdf').then((pdf)=>{
            const totalPages=pdf.internal.getNumberOfPages();
            for(let i=1;i<=totalPages;i++){
                pdf.setPage(i);
                pdf.setFont('helvetica','normal');
                pdf.setFontSize(10);
                pdf.setTextColor(120, 120, 120);
                pdf.text(`Page ${i} of ${totalPages}`, pdf.internal.pageSize.getWidth()-1.2,pdf.internal.pageSize.getHeight()-0.4,{align:'right'});
            }
        }).save();
    }

    exportDoc(){
        const{title,author}=this.getDocInfo();
        const docContent= `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body>
                <h1>${title}</h1>
                <p>Author:${author}</p>
                <hr>
                ${this.editor.getEditorContent()}
            </body>
            </html>
        `;
        const docBlob=htmlDocx.asBlob(docContent);
        saveAs(docBlob,`${title}.docx`);
    }
}

const docEditor=new DocEditor('content-editor');
const docExporter=new DocExporter(docEditor);


