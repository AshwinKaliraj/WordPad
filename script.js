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
        if (size){
            this.formatText('fontSize',size);
        }
    }
     changeFont(font){
        if (font){
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



}