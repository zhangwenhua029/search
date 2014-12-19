$(function() {
	$_title = $("#title");
	$_loginname=$_title.find(".loginname").hide();
	$_index = $_title.find(".index");
	$_login = $_title.find(".login").hide();
	$_exit = $_title.find(".exit").hide();
	$_test = $_title.find(".test");

	$_leftnav = $("#leftnav");
	$_leftnav_scan = $_leftnav.find("ul.scan").hide();
	$_leftnav_mana = $_leftnav.find("ul.mana").hide();

	$_content = $("#content");
	$_content_manage = $_content.find(".manage").hide();
	$_content_welcome = $_content.find("#welcome");
	$_content_login = $_content.find("#login");
	$_content_search=$_content.find("#search");
	$_content_search_result=$_content.find("#search_result");
	var loginname = "";

	checkLogin();
	$_test.click(function() {
		test();
	});
	$_index.click(function() {
		$_content_manage.hide();
		$_content_welcome.show();
	});
	$_login.click(function() {
		$_content_manage.hide();
		$_content_login.show();
		$_content_login.find(".name").focus();
	});
	$_exit.click(function() {
		exit();
	});
	$_content_login.find(".submit").click(function() {
		login();
	});
	
	$_leftnav_scan.find("li a").click(function() {
		$_content_manage.hide();
		$_content_search.show();
	});
	$_content_search.find(".searchinput").keyup(function() {
		search($.trim($(this).val()));
	});
	$_content_search.find(".searchbutton").click(function() {
		if ($.trim($_content_search.find(".searchinput").val())=='') {
			alert("请输入您要搜索的关键词");
			return false;
		}
		searchRusult($.trim($_content_search.find(".searchinput").val()));
	});

});

function search($inputvalue) {
	var url = "index.php";
	var data = {
		"do" : "search",
		"value":$inputvalue,
		"itemId":0
	};
	$.getJSON(url, {
		"data" : data
	}, function(res) {
		var num=res.num;
		$_content_search.find(".search_result ul").html('');	
		for (var i = 1; i <= num; i++) {
			$_content_search.find(".search_result ul").append("<li><a rel=\""+res[i].voteId+"\">"+res[i].vote_name+"</a></li>");
		}
		$_content_search.find(".search_result").slideDown("fast");
		
		$(document).click(function() {
			$_content_search.find(".search_result").hide();
		});
		$_content_search.find(".search_result ul").delegate("a","click",function() {
			searchRusult($(this).text(),$(this).attr("rel"));
		});
	});
}

function searchRusult($value,$itemId=0) {
	var url = "index.php";
	var data = {
		"do" : "search",
		"value":$value,
		"itemId":$itemId
	};
	$.getJSON(url, {
		"data" : data
	}, function(res) {
		var num=res.num;
		$_content_search_result.find(".result_show ul").html('');
		if (num==0) {
			$_content_search_result.find("h1").text('没有找到和您关键词匹配的条目');
		}
		else if (num==1) {
			$_content_search_result.find("h1").text("该投票主题的信息如下");
			var time = new Date(res[1].vote_cretime * 1000);
			var create_date = time.getFullYear() + "-" + (time.getMonth() + 1) + "-"+ time.getDate() + " " + time.getHours() + ":"+ time.getMinutes();
			var alivedays=res[1].vote_alivedays;
			var votetype=res[1].vote_kind-1?"多选投票":"单选投票";
			$_content_search_result.find(".result_show ul").append("<li><a>投票主题:"+res[1].vote_name+"</a></li><li><a>创建者:"+res[1].vote_creater+"</a></li><li><a>创建日期:"+create_date+"</a></li><li><a>有效时长:"+alivedays+"天</a></li><li><a>投票类型:"+votetype+"</a></li>");
		}
		else {
			$_content_search_result.find("h1").text('搜索到的投票主题如下');
			for (var i = 1; i <= num; i++) {
				$_content_search_result.find(".result_show ul").append("<li><a rel=\""+res[i].voteId+"\">"+res[i].vote_name+"</a></li>");
			}
		}
	});
	$_content_manage.hide();
	$_content_search_result.slideDown("normal");
}

function exit() {
	var url = "index.php";
	var data = {
		"do" : "exit"
	};
	$.post(url, {
		"data" : data
	}, function() {
		checkLogin();
	});
}

function login() {
	$name = $_content_login.find(".name");
	$passport = $_content_login.find(".passport");
	$name.val($.trim($name.val()));
	var erg = /^[a-z0-9_-]{6,18}$/;
	if ($name.val() == '') {
		alert('请输入用户名');
		$name.focus();
		return false;
	}
	if ($passport.val() == '') {
		alert('请输入密码');
		$passport.focus();
		return false;
	}
	if (!erg.test($passport.val())) {
		alert('密码格式不正确');
		$passport.val('');
		$passport.focus();
		return false;
	}
	var url = "index.php";
	var data = {
		"do" : "login",
		"name" : $name.val(),
		"passport" : $passport.val()
	};
	$.getJSON(url, {
		"data" : data
	}, function(res) {
		$passport.val('');
		switch (res.loginresult) {
		case 0:
			checkLogin();
			break;
		case 1:
			alert('密码错误');
			$passport.focus();
			break;
		case 2:
			alert('用户名不存在');
			$name.focus();
			break;
		case 3:
			alert('该账号已被冻结，登陆失败');
			$name.focus();
			break;
		}
	});
}

function checkLogin() {
	var url = "index.php";
	var data = {
		"do" : "islogin"
	};
	$.getJSON(url, {
		"data" : data
	}, function(res) {
		loginname = res.loginname;
		$_title.find(".loginname").text(loginname);
		if (res.isboss) {
			$_leftnav_mana.find("li:last").show();
		}
		else {
			$_leftnav_mana.find("li:last").hide();
		}
		if (res.islogin) {
			$_loginname.show();
			$_login.hide();
			$_exit.show();
			$_leftnav_mana.show();
			$_leftnav_scan.hide();
		} else {
			$_loginname.hide();
			$_login.show();
			$_exit.hide();
			$_leftnav_mana.hide();
			$_leftnav_scan.show();
		}
		$_index.click();
	});
}

/*
$(window).unload(function() {
	var url = "index.php";
	var data = {
		"do" : "unload"
	};
	$.post(url, {
		"data" : data
	});
});
*/
 
// 测试用函数
function test() {
	var url = "index.php";
	var data = {
		"do" : "test",
		"type" : "type",
		"num" : "num",
		"votetheme" : " votetheme",
		"creater" : " loginname "
	};
	data['item1'] = 'ddddddd';
	data.item2 = 'dddddddddddddd';
	$.post(url, {
		"data" : data
	}, function(res) {
		alert(res);
	});
}

