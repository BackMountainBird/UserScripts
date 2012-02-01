// ==UserScript==
// @name           AtUser&ajaxPost
// @namespace      whx123m@cc98.org
// @description    仿微博提醒和快速提交
// @include        http://www.cc98.org/dispbbs.asp*
// @include        http://www.cc98.org/reannounce.asp*
// @include 	   http://www.cc98.org/editannounce.asp*
// @exclude      	
// @author         whx123m
// @version        1.01
// ==/UserScript==


var submitForm = document.getElementsByName("frmAnnounce")[0];
var currentUrl=window.location.href.toString().toLowerCase();
var time=0;
var pendingAts=null;

function jumpToDisp(timeout){
    setTimeout('var currentUrl=window.location.href.toString().toLowerCase(); \
                if(currentUrl.indexOf("editannounce.asp")>=0) \
                    window.location.href=currentUrl.replace("editannounce.asp","dispbbs.asp").replace("&bm=","#"); \
                else if(currentUrl.indexOf("reannounce.asp")>=0) \
                    window.location.href=currentUrl.replace("reannounce.asp","dispbbs.asp")+"#bottom"; \
                else window.location.reload();\
               ',parseInt(timeout));
}

function reloadPage(time){
    setTimeout("window.location.reload()",parseInt(time));
}
function createStateDialog(){
    var stateDialog = document.createElement("div");
    stateDialog.innerHTML =
    '<div><strong>正在发表回复</strong></div>\
	 <ul id=\"stateMessage\"></ul>';
    stateDialog.id = "atStateDialog";
    stateDialog.setAttribute("style", "position:fixed;top:50%;left:50%;width:800px;background:#eee;opacity:0.8;padding:10px;\
                                       -webkit-box-shadow: black 2px 2px 10px;-webkit-border-radius:6px;z-index:999\
                                       margin-top:-100px;margin-left:-400px");
    document.body.appendChild(stateDialog);
}

function deleteStateDialog(time){
    setTimeout('var element=document.getElementById("atStateDialog");\
                    if(element!=null) \
                        element.parentNode.removeChild(element)',parseInt(time));
}

function addStateMessage(message,color){
    if((document.getElementById('stateMessage')==null)||(message==null))
        return;
    color=color||"0xfff";
    document.getElementById("stateMessage").innerHTML +=
    "<li style=\"color:"+color.toString()+"\">"
    +message.toString()
    +"</li>";
}

function atUser(name){
    var dispUrl=currentUrl.replace("reannounce.asp","dispbbs.asp").replace("editannounce.asp","dispbbs.asp").replace("&bm=","#");
    var message='我在帖子'+"[url="+dispUrl+"][color=blue]这个帖子[/color][/url]"+'中@了你,快来看看吧~!';
    var request = new XMLHttpRequest();
    if (request == null) return;
    request.onreadystatechange = function(){
        if (request.readyState == 4) {
            if (request.status == 200) {
                pendingAts.pop();
                if (request.responseText.indexOf("操作成功") != -1){
                    addStateMessage("@"+name+":操作成功!","green");
                }else {
                    var errorMsg=/<li>([^]*?)<br>/g.exec(request.responseText);
                    if(errorMsg instanceof Array)
                        addStateMessage("发贴失败:"+errorMsg[1]+"","brown");
                    else
                        addStateMessage("未知失败:","red");
                    time+=2000;
                }
            }else{
                addStateMessage("@"+name+":网络失败!","red");
                time+=1000;
            }
            if((!pendingAts)||(pendingAts.length==0)){
                console.log(time);
                jumpToDisp(time>6000?6000:time);
            }
        }
    };
    var data = "touser="+encodeURIComponent(name)+"&font="+"&title="+encodeURIComponent("@提示")+"&message="+encodeURIComponent(message);
    request.open("post",'http://www.cc98.org/messanger.asp?action=send', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
    request.setRequestHeader("If-Modified-Since","0");
    request.send(data);
}
function atUsers(){
    if ((pendingAts != null) && (pendingAts.length > 0)){
        var i=0;
        for(i=0;i<pendingAts.length;i++) {
            var name = pendingAts[i].replace("@@",'').toString().replace(/\s+/,'');
            atUser(name);
        }
    }else{
        jumpToDisp(0);
    }
}

function getExpression(expressionName){
    var expList=document.getElementsByName(expressionName);
    if(expList instanceof NodeList)
        for(var i=0;i<expList.length;i++)
            if(expList[i].checked)
                return expList[i].value;
    return "face7.gif";
}

//cc98 应该统一大小写,吐槽一下
function postData(){
    //
    var dataSend = document.getElementById("content").value;
    dataSend = dataSend.replace(/\n/g,"%0D%0A");
    dataSend = dataSend.replace(/\s/g,"&nbsp;");
    dataSend = dataSend.replace(/\&/g,"%26");  

    var formData='subject=';
    if (document.getElementsByName('subject')[0] != undefined)	// 如果存在标题
    {
        var titleData = document.getElementsByName('subject')[0].value;
        formData += titleData;
    }
    formData+="&content="+dataSend;
    //from ajaxpost.user.js by tyk1d
    if(currentUrl.indexOf("editannounce.asp")>0){
        postUrl=currentUrl.replace("editannounce.asp","SaveditAnnounce.asp");
        var upfilerename=document.getElementsByName("upfilerename")[0].value;
        var followup=document.getElementsByName("followup")[0].value;
        var star=document.getElementsByName("star")[0].value;
        var TotalUseTable=document.getElementsByName("TotalUseTable")[0].value;
        var signflag=document.getElementsByName("signflag")[0].value;
        var username=document.getElementsByName("username")[0].value;
        var passwd=document.getElementsByName("passwd")[0].value;
        var Expression=getExpression("Expression");
        formData+="&upfilerename="+upfilerename
        +"&followup="   +followup
        +"&star="   +star
        +"&TotalUseTable="   +TotalUseTable
        +"&signflag="   +signflag
        +"&username="   +username
        +"&passwd="   +passwd
        +"&Expression=" +Expression;
    }else {
        var postUrl="http://www.cc98.org/SaveReAnnounce.asp?"
        +"BoardID="+currentUrl.match(/boardid=([^&]*)/)[1];
        if(currentUrl.indexOf("reannouce.asp")>0){
            postUrl=postUrl+"&method=Topic&bm=";
        }else{
            postUrl=postUrl+"&method=fastreply";
        }
        var followup=document.getElementsByName("followup")[0].value;
        var RootID=(document.getElementsByName("RootID")[0]||document.getElementsByName("rootID")[0]).value;
        var star=document.getElementsByName("star")[0].value;
        var TotalUseTable=document.getElementsByName("TotalUseTable")[0].value;
        var username=(document.getElementsByName("UserName")[0]||document.getElementsByName("username")[0]).value;
        var passwd=document.getElementsByName("passwd")[0].value;
        var Expression=getExpression("Expression");
        var signflag=document.getElementsByName("signflag")[0].value;
        formData+="&followup="   +followup
        +"&RootID=" +RootID
        +"&star="   +star
        +"&TotalUseTable="   +TotalUseTable
        +"&signflag="   +signflag
        +"&username="   +username
        +"&passwd="   +passwd
        +"&Expression=" +Expression
        +"&signflag="  +signflag;
    }

    var request = new XMLHttpRequest();
    request.open('POST', postUrl,true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.onload=function(e){
        var dummy=1;
    }
    request.onreadystatechange = function()
    {
        if (request.readyState == 4) {
            if ((request.status == 200)||(request.status == 0)) {
                if (request.responseText.indexOf("帖子成功") >= 0){
                    addStateMessage("发贴成功!","blue");
                    atUsers();
                }else {
                    var errorMsg=/<li>([^]*?)<br>/g.exec(request.responseText);
                    if(errorMsg instanceof Array)
                        addStateMessage("发贴失败:"+errorMsg[1]+"","purple");
                    else
                        addStateMessage("未知失败:","red");
                    enableForm();
                    deleteStateDialog(2000);
                }
            }else{
                addStateMessage("网络失败!","red");
                enableForm();
                deleteStateDialog(2000);
            }
        }
    };
    request.send(formData);
}

//modified from original js in utility.post.js
var uploadImgFix = function(){
    if(document.getElementById('content')==null)
        return false;
    var isUploadImgFix = (document.getElementById('uploadImgFix')!=null) ? document.getElementById('uploadImgFix').checked : false
    if(isUploadImgFix){
        var pattern = /\[upload=(gif|jpg|jpeg|bmp|png),1\](http:\/\/file\.cc98\.org\/.[^\[\'\"\:\(\)]*)(gif|jpg|jpeg|bmp|png)\[\/upload\]/gi;
        $('content').value = $('content').value.replace(pattern,'[upload=$1]$2$1[/upload]');
    }
}

//modified from original js in utility.post.js
function disableForm(){
    if (document.all||document.getElementById){
        for (i=0;i<submitForm.length;i++){
            var tempobj=submitForm.elements[i]
            if(tempobj.type.toLowerCase()=="submit"||tempobj.type.toLowerCase()=="reset")
                tempobj.disabled=true
        }
    }
}


function enableForm(){
    if (document.all||document.getElementById){
        for (i=0;i<submitForm.length;i++){
            var tempobj=submitForm.elements[i]
            if(tempobj.type.toLowerCase()=="submit"||tempobj.type.toLowerCase()=="reset")
                tempobj.disabled="";
        }
    }
}

function submitonce(){
    uploadImgFix();
    disableForm();
    postData();
}

function fillInPendingAts(){
    var pattern = /^(\[quote\]|\[quotex\])[\s\S]*(\[\/quote\]|\[\/quotex\])/ig;
    var val = document.getElementById("content").value.replace(pattern,'');
    pattern = /@@([^\s^@]+\s)/ig;
    pendingAts = val.match(pattern);
}

submitForm.onsubmit = function(e){
    e.preventDefault();
    fillInPendingAts();
    createStateDialog();
    submitonce();
    return false;
}