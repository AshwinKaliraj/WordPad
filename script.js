class doceditor{
    constructor(editorid){
        this.contentarea=document.getElementById(editorid);
    }
    formattext(cmd,va=null){
        document.execCommand(cmd,false,val);
        this.contentarea.focus();
    }
    changesize(size){
    if(size){
        this.formatText('fontSize',size);
    }
}
changeFont(font){
    if(font){
        this.formatText('fontName',font);
    }
}
}
const doceditor= new doceditor('content-editor');
