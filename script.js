class DocEditor{
    constructor(editorId){
        this.contentArea=document.getElementById(editorId);
        this.contentArea.focus(); 
        this.activeWrapper=null; 
        
        this.imageInput=document.getElementById('image-upload');
        this.imageInput.addEventListener('change',this.handleImageUpload.bind(this));
        
        this.contentArea.addEventListener('click',this.handleEditorClick.bind(this));
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
        const wrapperHtml =`<div class="image-wrapper"><img src="${src}" style="width: auto; height: auto;"></div>`;
        this.formatText('insertHTML',wrapperHtml);
    }

    insertGrid(){
        const numRows=parseInt(prompt('Number of rows:'),10);
        const numCols=parseInt(prompt('Number of columns:'),10);
        if(isNaN(numRows)||isNaN(numCols)||numRows<1||numCols<1){
            alert('Please enter valid numbers for rows and columns.');
            return;
        }
        let tableCode='<table border="1" style="width:100%; border-collapse:collapse; border-color:#ccc;">';
        for(let row=0;row<numRows;row++){
            tableCode+='<tr>';
            for(let col=0;col<numCols;col++){
                tableCode+='<td contenteditable="true">&nbsp;</td>';
            }
            tableCode+='</tr>';
        }
        tableCode+='</table>';
        this.formatText('insertHTML',tableCode);
    }

    clearContent(){
        if(confirm('Clear all content? This cannot be undone.')){
            this.contentArea.innerHTML='<p>Start crafting your document here...</p>';
            this.contentArea.focus();
        }
    }
     getEditorContent(){
        return this.contentArea.innerHTML;
    }

    handleEditorClick(event){
        const wrapper=event.target.closest('.image-wrapper');
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
            if(newWidth>20 && newHeight>20){  
                img.style.width=`${newWidth}px`;
                img.style.height=`${newHeight}px`;
            }
        };

        const onMouseUp=()=>{
            document.removeEventListener('mousemove',onMouseMove);
            document.removeEventListener('mouseup',onMouseUp);
        };

        document.addEventListener('mousemove',onMouseMove);
        document.addEventListener('mouseup',onMouseUp);
    }
}



const docEditor=new DocEditor('content-editor');



