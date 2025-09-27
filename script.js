class doceditor{
    constructor(editorid){
        this.contentarea=document.getElementById(editorid);
    }
    formattext(cmd,va=null){
        document.execCommand(cmd,false,val);
        this.contentarea.focus();
    }
}
const doceditor= new doceditor('content-editor');