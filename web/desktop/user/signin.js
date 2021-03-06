import {Utils} from '../../libs/utils.js';
import {Validate} from '../../libs/validate.js';

let $utils = new Utils();
let web = getWeb();
let $$ = UIkit.util;

Page({
	data:{},
	smscodeTimer:0,
	validator: null,

	onReady: function( get ) {

		var that = this;

		// 错误提醒框关闭事件
		try {
			$$.on('.uk-alert', 'hide', ()=>{
				setTimeout(()=>{$utils.parentHeight();}, 500);
			});
		} catch( e ) { console.log( 'Error @Alert Hide Event', e); }

		// 表单验证类
		try {
			this.validator = new Validate({
				form:'.iframe-form',
				change: ( error, element)=>{ $utils.parentHeight(); },
				error: (message, extra)=>{ $utils.parentHeight(); },
				complete: ()=>{ $utils.parentHeight(); }
			});

		} catch( e ) { console.log( 'Error @Validate', e); }


		// 图形验证码
		$('.image.vcode').click(function(){
			that.changeVcode();
		});
	},


	/**
	 * 更换图片验证码
	 * @return {[type]} [description]
	 */
	changeVcode: function(){
		var api = '/_api/xpmsns/user/user/vcode?width=150&height=40&size=20&t=' + Date.parse(new Date()); 
		$('.image.vcode img').attr('src', api);
	},
})