import {Utils} from '../../../../libs/utils.js';
import {$$} from '../../../../libs/component.js';
import {Validate} from '../../../../libs/validate.js';
import {Article} from '../../../../libs/article.js';

$$.import(
	'uploader/image',
    'editor/image',
    'editor/html'
);

let $utils = new Utils();
Page({
	data:{},
	onReady: function( get ) {
        var that = this;
        

        // SET 日期插件
        jQuery.datetimepicker.setLocale('zh');
        jQuery('.datetime-picker').datetimepicker({
            format: 'Y-m-d H:i'
            // format:'Y年m月d日 H:i',
            // value:'1983年01月17日 19:20'
        });

        // 文章日期
        try {
			( new Article( 'article' ) ).init();
		} catch( e ) {
			console.log( 'Error @ArticleView init', e);
        }

        // 加载组件
		try {
			// ImageUploader
			$$('uploader[type=image]').ImageUploader({
				change: ( data, $item )=>{ $utils.parentHeight(); },
				add: (event, data)=>{  return true; },
				beforeupload: (event, data)=>{  return true; },
				uploaded:(data, $item) =>{  $utils.parentNotification( '<span uk-icon="icon: check;ratio:1.3"></span>  上传成功', 'success', 'top-right'); },
				error: ( errors, $elm ) =>{
					for( var i in errors ){
						let error = errors[i];
						$utils.parentNotification( '<span uk-icon="icon: close;ratio:1.3"></span>  '+ error.message, 'danger', 'top-right');
					}
				}
			});
        } catch( e ) { console.log( 'Error @ImageUploader', e); }

        try {
            // HtmlEditor
            $$('editor[type=html]').HtmlEditor({});
        } catch( e ) { console.log( 'Error @HtmlEditor', e); }


        // 错误提醒框关闭事件
		try {
			UIkit.util.on('.uk-alert', 'hide', ()=>{
				setTimeout(()=>{$utils.parentHeight();}, 500);
			});
		} catch( e ) { console.log( 'Error @Alert Hide Event', e); }

		// 表单验证类
		try {
			this.validator = new Validate({
				form:'.iframe-form',
				change: (error, element)=>{ $utils.parentHeight(); },
				error: (message, extra)=>{ $utils.parentHeight(); },
				complete: ()=>{ $utils.parentHeight(); }
			});

        } catch( e ) { console.log( 'Error @Validate', e); }

        // 设置高度
        let height = $( document ).height() - 160;
        $('.article-preview').css("min-height", height);
            
        // 设定文章状态
        let article = this.data.article || {};
        if ( article.code != 0 && article.code != undefined ) {
            $('.action-panel').remove();
            return;
        } 
        this.updateStatus( article.status, article.draft_status );

        // 设置QuickLink按钮
        this.setQuickLink();

    
    },

    /**
     * 根据当前状态, 设定呈现样式
     * @param {string} status 
     */
    updateStatus: function( status, draft_status) {
        
        // 审核中
        if ( status == "auditing" ) {
            this.unlockAction();
            this.setStatus("warning", "审核中");
            this.showAction([ "save", "preview", "resolve", "reject"]);
        
        // 已发布, 但更新文稿未发布
        } else if ( status == "published" && draft_status == "unapplied" ) {
            this.unlockAction();
            this.setStatus("warning", "待更新");
            this.showAction(["update", "save", "preview"]);

        // 已发布, 且草稿未更新
        } else if ( status == "published" && (draft_status =="applied" || draft_status == undefined) ) {

            this.unlockAction();
            this.setStatus("success", "已发布");
            this.showAction(["cancel", "save", "preview"]);

        // 默认状态 (草稿)
        } else {
            // 默认状态
            this.unlockAction();
            this.setStatus("danger", "草稿");
            this.showAction(["save", "preview", "publish"]);
        }
    },

    /**
     * 显示功能按钮
     * @param {array} actions 功能按钮
     */
    showAction:function( actions ){

        $(`.action-method`).removeClass('action-active');

        for( var i in actions ) {
            $(`.action-${actions[i]}`)
                .removeClass('uk-hidden')
                .removeClass('uk-disabled')
                .removeAttr('disabled')
                .addClass('action-active')
            ;
        }
    },

    /**
     * 显示状态信息
     * @param {string} className 
     * @param {string} name 
     */
    setStatus: function( className, name  ) {
        $('.status-label').html( name );
        $('.status-label')
            .removeClass('uk-label-success')
            .removeClass('uk-label-warning')
            .removeClass('uk-label-danger')
            .removeClass('uk-hidden')
        ;
        if ( className ) {
            $('.status-label').addClass(`uk-label-${className}`);
        }
    },

    showLoading: function( message ) {
        $('.uk-loading').html( message );
        $('.uk-loading')
            .removeClass('uk-hidden');

        $('.quick-link')
            .addClass('uk-hidden');
    },

    hideLoading: function() {
        $('.uk-loading')
            .addClass('uk-hidden');

        $('.quick-link')
            .removeClass('uk-hidden');
    },

    /**
     * 锁定所有操作
     */
    lockAction: function(){

        $('.uk-action')
            .addClass('uk-disabled')
            .attr('disabled', 'disabled')
        ;
        $('form')
            .addClass('uk-disabled')
            .attr('disabled', 'disabled')
        ;
    },

    /**
     * 解锁所有操作
     */
    unlockAction: function(){

        $('.uk-loading').addClass('uk-hidden');
        $('.quick-link').removeClass('uk-hidden');

        $('.uk-action')
            .removeClass('uk-disabled')
            .removeAttr('disabled')
        ;

        $('form')
            .removeClass('uk-disabled')
            .removeAttr('disabled')
        ;
    },

    /**
     * 发布设置按钮
     */
    setQuickLink: function(){
        
        let getScroll = function() {
            if (window.pageYOffset != undefined) {
                return [pageXOffset, pageYOffset];
            } else {
                var sx, sy, d = document,
                    r = d.documentElement,
                    b = d.body;
                sx = r.scrollLeft || b.scrollLeft || 0;
                sy = r.scrollTop || b.scrollTop || 0;
                return [sx, sy];
            }
        }

        let offset = $('#publish-setting').offset();
        if ( !offset ) {
            return;
        }
    
        // 监听滚动事件
        window.addEventListener('scroll', (event) => {
            let pos = getScroll();
            // console.log( pos[1] , offset.top );
            if ( pos[1] > (offset.top - 200)) {
                $('#quick-link-btn').attr('href', "#article-edit");
                $('#quick-link-btn').html('<span uk-icon="icon: chevron-up;"></span> 编辑文章');
            } else {
                $('#quick-link-btn').attr('href', "#publish-setting");
                $('#quick-link-btn').html('<span uk-icon="icon: chevron-down;"></span> 发布设置');
            }
        });
    },
    
    remove: function( event ) {
        let $elm = $(event.target);
        let article_id = $('input[name=article_id]').val();
        let url = '/_api/xpmsns/pages/article/staffRemove';

        if ( article_id == "" ) {
            UIkit.notification({message: `删除失败(文章尚未保存)`, status: 'danger', pos: 'top-right'});
            UIkit.drop($elm.parents('.remove-drop')).hide();
            return;
        }

        window.page.lockAction();
        UIkit.drop($elm.parents('.remove-drop')).hide();
        
        $.post( url, {article_id:article_id}, (data)=>{

            if( data.code != 0  && data.message ) {
                UIkit.notification({message: `删除失败(${data.message})`, status: 'danger', pos: 'top-right'});
                window.page.unlockAction();
                return;
            }

            // 转向到列表页
            UIkit.notification({message: `删除成功`, status: 'success', pos: 'top-right'});
            setTimeout(() => {
                window.location = '/_a/i/xpmsns/pages/article/index';    
            }, 500);

        }, 'json')
        .error( ( xhr, status, error )=>{
            UIkit.notification({message: '删除失败', status: 'danger', pos: 'top-right'});
            window.page.unlockAction();
        });
    },

    copyToClipboard: function(event) {

        var elem = document.getElementById("article-location");

        var targetId = "_hiddenCopyText_";
        var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
        var origSelectionStart, origSelectionEnd;
        if (isInput) {
            // can just use the original source element for the selection and copy
            target = elem;
            origSelectionStart = elem.selectionStart;
            origSelectionEnd = elem.selectionEnd;
        } else {
            // must use a temporary form element for the selection and copy
            target = document.getElementById(targetId);
            if (!target) {
                var target = document.createElement("textarea");
                target.style.position = "absolute";
                target.style.left = "-9999px";
                target.style.top = "0";
                target.id = targetId;
                document.body.appendChild(target);
            }
            target.textContent = elem.textContent;
        }
        // select the content
        var currentFocus = document.activeElement;
        target.focus();
        target.setSelectionRange(0, target.value.length);
        
        // copy the selection
        var succeed;
        try {
              succeed = document.execCommand("copy");
        } catch(e) {
            succeed = false;
        }
        // restore original focus
        if (currentFocus && typeof currentFocus.focus === "function") {
            currentFocus.focus();
        }
        
        if (isInput) {
            // restore prior selection
            elem.setSelectionRange(origSelectionStart, origSelectionEnd);
        } else {
            // clear temporary content
            target.textContent = "";
        }

        UIkit.notification({message: `复制成功`, status: 'success', pos: 'top-right'});
        return succeed;
    }
})