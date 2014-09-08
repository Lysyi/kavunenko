/*!
 * ----------------------------------------------------------------------
 * init
 * ----------------------------------------------------------------------
 */

var iframeData;
var shopData;
var productData;
var userData;
var couponData;
var bonusesData;
var bonusesInited;
var facebookInited;
var additionalBonusesValue = 0;

var currentScreen;
var lastScreen;

var clicked;
var lastPrice;

var loginAction;
var loginMode;

var currentNetworkPopup;


/* *** */
var socNetworkStatuses = new Array();

socNetworkStatuses["GooglePlus"] = false;
socNetworkStatuses["Twitter"] = false;
socNetworkStatuses["Facebook"] = false;
//socNetworkStatuses["VKontakte"] = false;
/* *** */

$( document ).ready(function() {
    Init();
    CheckSocialsAuth();
    $( ".popup-gameover").hide();
    $( document.body ).css("background-color", "rgba(15, 26, 33, 0.9)");

    setTimeout(ShowLeftDiv, 1000);
});

function CheckSocialsAuth(network)
{
    if (typeof network == "undefined" || network == "all")
    {
        $("#checkGooglePlusAuth").attr("src", "https://plus.google.com/up/?continue=https://www.google.com/intl/en/images/logos/accounts_logo.png&type=st&gpsrc=ogpy0");
        $("#checkTwitterAuth").attr("src", "https://twitter.com/login?redirect_after_login=%2Fimages%2Fspinner.gif");
    } else {
        var d = new Date();
        if (network == "twitter")
        {
            $("#checkTwitterAuth").attr("src", "https://twitter.com/login?redirect_after_login=%2Fimages%2Fspinner.gif&luckyprice=" + d.getTime());
        }
        if (network == "google")
        {
            $("#checkGooglePlusAuth").attr("src", "https://plus.google.com/up/?continue=https://www.google.com/intl/en/images/logos/accounts_logo.png&type=st&gpsrc=ogpy0&luckyprice=" + d.getTime());
        }
        if (network == "facebook")
        {
            console.log("check FB login");
            FB.getLoginStatus(function (response) {
                console.log("response!");
                console.log(response);
                if (response.status === 'connected') {
                    //var uid = response.authResponse.userID;
                    //var accessToken = response.authResponse.accessToken;
                    set_login_status("facebook", true);
                } else if (response.status === 'not_authorized') {
                    set_login_status("facebook", true);
                } else {
                    // the user isn't logged in to Facebook.
                }
            }, true); // force to FB server
        }
    } // if not all
} // CheckSocialsAuth

function ShowLeftDiv()
{
    $( ".popup-hellow .leftdiv" ).animate({
        opacity: 1.0,
        left: "+=100"
    }, 1000, function() {
        // Animation complete.
    });
    $( ".arrow-intro" ).animate({
        opacity: 1.0
    }, 1000, function() {
        // Animation complete.
    });

}

function Init()
{
	var uriHash = decodeURIComponent( window.location.hash );
    console.log( "[Init] uriHash = " + uriHash + " | window.location = " + window.location );
	if (uriHash.indexOf("#") > -1)
	{
		uriHash = uriHash.substring(1);
	}
	iframeData = $.parseJSON(uriHash);
    console.log( "[Init] iframeData = " + iframeData );

    RestApiGet("/init.json/"+iframeData["shop"]+"/"+iframeData["product"], onInitSuccess, onInitError)

    // bind start button
    $(".popup-hellow .go-button").click(function() {
        $( "#game-wrapper" ).show();
        $( document.body ).css("background-color", "rgba(150, 150, 150, 0.8)");
        $( "#game-wrapper" ).animate({
            opacity: 1.0,
            scale:1.0
        }, 500, function() {
        });
        setTimeout(MakeFirstClick, 1000);
    });

    $("#main-button").hide();
} // Init

function onInitSuccess(data)
{
    console.log("data: %o", data)
    console.log( "shop name = " + data["shopData"]["name"] );

    shopData = data["shopData"];
    productData = data["productData"];
    userData = data["userData"];
    bonusesData = data["bonuses"];

    lastPrice = productData["price"];

    Inited();
}

function onInitError(errorCode)
{
    alert("init error ["+errorCode+"]");
}

function MakeFirstClick()
{
    if (userData["balance"] > 0)
    {
        $(".takebuttonsection .takebutton").trigger( "click" );
        setTimeout(function(){
            $("#main-button").fadeIn(700);
        }, 700);
    } else {
        console.log("no more clicks");
    }
}

function Inited()
{
    clicked = 0;

    if (userData["registered"] == 0)
    {
        var ul = document.createElement("script");
        ul.type = "text/javascript";
        ul.src = "//ulogin.ru/js/ulogin.js";
        document.getElementsByTagName("head")[0].appendChild(ul);
    }

    $("#take-button-coupon").show();

    $('#email-form').on('submit', function(e) {
        e.preventDefault();  //prevent form from submitting
        UseCouponByEmail();
    });

    localStorage.removeItem("res_en");
    localStorage.removeItem("res_ru");

    i18n.init({
        //useLocalStorage: true,
        //localStorageExpirationTime: 86400000,
        debug: true,
        lng: shopData['lang'],
        resGetPath: 'locales/__lng__/__ns__.json',
        ns: 'widget',
        defaultNs: 'widget',
        getAsync: true
    }, function(t) {
        $("a").i18n();
        $("span").i18n();
        $("div").i18n();
        $("h4").i18n();
        InitLangValues();

        ShowScreen("game");
        InitLoginButton();
    });
} // Inited

function InitLangValues()
{
    $("#email-3").attr("placeholder", i18n.t("interface.coupon-by-email-placeholder"));
    $("#email-form .submit-button-login").val(i18n.t("interface.submit-form-send"));
}

function set_login_status(name, status)
{
    console.log("[set_login_status] | " + name + " = " + status);
    socNetworkStatuses[name] = status;
    if (status == true && typeof bonusesData != "undefined")
    {
        bonusesInited = false;
        InitBonuses();
    }
    if (status)
    {
        $(".login-wrapper-" + name).css("display", "none");
    } else {
        $(".login-wrapper-" + name).css("display", "block");
    }
} // set_login_status

function LoginUserTo(network)
{
    currentNetworkPopup = network;

    var url = "";
    if (network == "twitter")
    {
        url = "https://twitter.com/login?redirect_after_login=%2Fimages%2Fspinner.gif";
    }
    if (network == "google")
    {
        url = "https://plus.google.com/up/?continue=https://www.google.com/intl/en/images/logos/accounts_logo.png&type=st&gpsrc=ogpy0";
    }
    if (network == "facebook")
    {
        url = "https://www.facebook.com/messages/";
    }
    var w = 400;
    var h = 300;
    var left = (screen.width/2)-(w/2);
    var top = (screen.height/2)-(h/2);
    var login_window = window.open(url, "Login to " + network, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
    /*
    login_window.onbeforeunload = function(){
        // check for login
        CheckSocialsAuth(currentNetworkPopup);
    }
    */
    var interval = window.setInterval(function() {
        try {
            if (login_window == null || login_window.closed) {
                window.clearInterval(interval);
                console.log("login to " + currentNetworkPopup + " closed!");
                CheckSocialsAuth(currentNetworkPopup);
            }
        }
        catch (e) {
        }
    }, 1000);
} // LoginUserTo

/*!
 * ----------------------------------------------------------------------
 * header inits
 * ----------------------------------------------------------------------
 */

function InitLoginButton()
{
    console.log("[InitLoginButton] userData[registered] = " + userData["registered"] + " | userData[name] = " + userData["name"]);
    if (userData["registered"] == 0)
    {
        // ***
        // init as login button
        // ***
        $("#login-button").html(i18n.t("interface.head-enter"));
        $(".avatar-login-block").css("background-image", "url(images/login_icon.png)");

        $("#login-button").unbind('click');
        $("#login-button").bind('click', function(e){
            e.preventDefault();
            loginMode = "socialonly";
            loginAction = "back";
            ShowScreen("login");
        });

        $("#login-closebutton").unbind('click');
        $("#login-closebutton").bind('click', function(e){
            e.preventDefault();
            $(".login-div").fadeOut(200);
        });
    } else {
        // ***
        // init as info button
        // ***
        $("#login-button").html(userData["name"]);
        if (userData['photo'].length > 0)
        {
            $(".avatar-login-block").css("background-image", "url("+userData['photo']+")");
        } else {
            $(".avatar-login-block").css("background-image", "url(images/login_icon.png)");
        }
        $("#login-button").unbind('click');
    }
} // InitLoginButton

/*!
 * ----------------------------------------------------------------------
 * screens
 * ----------------------------------------------------------------------
 */

     function ShowScreen(name)
     {
         console.log("[ShowScreen] name = " + name);
         //DisableAllScreens();
         lastScreen = currentScreen;
         currentScreen = name;
         if (name != "coupon")
         {
            $("#screen_" + name).fadeIn(50);
         }
         window["Init_" + name]();
     } // ShowScreen

/*
    function DisableAllScreens()
    {
       //$(".div1").hide();
    }
*/
/*
    function ShowPreviousScreen()
    {
        if (typeof(lastScreen) != "undefined")
        {
            ShowScreen(lastScreen);
        } else {
            ShowScreen("game");
        }
    } // ShowPreviousScreen
*/

 // ***** GAME *****
function Init_game()
{
    console.log("Init_game");
    SetProductName();
    SetProductImage("screen_game");
    SetClicks();
    SetNewPrice();
    InitBonuses();
    InitLuckyButton();

    $("#take-button-coupon").off('click');
    $("#take-button-coupon").on('click', function (e) {
        e.preventDefault();
        TakeCoupon();
    });
} // Init_game

function SetProductName()
{
    var content = productData["name"];
    $(".headitg-ithem").html(content);
    content = "<nobr>(" + GetPriceInHTML(productData["price_formatted"], productData["currency"]) + ")</nobr>";
    $(".ithem-description-text .product-price").html(content);
} // SetProductName

function SetProductImage(screen_name)
{
    var image_url = "url('" + productData["product_image"] + "')";
    $(".item-photo .photo").css("background-image", image_url);
} // SetProductImage

function SetClicks()
{
    $(".num-fly-cont .flying-num").html(userData["balance"]);
} // SetClicks

function SetNewPrice()
{
    if (typeof productData["new_price"] != 'undefined' && productData["new_price"] > 0) {
        $(".discount-num-cont .price-img2").html(GetPriceInHTML(productData["new_price_formatted"]));
        $(".discount-num-cont .money-sign").html(GetCurrencyString(productData["currency"], "full"));
        $(".discount-num-cont .discount-percents").html(productData["discount_percent"] + "%");

        $("#discount-line").css("visibility", "visible");
        $(".discount-num-cont .head").html("Новая цена");
        /*
         $("#screen_game .take-coupon-button").css("visibility", "visible");
         */
    } else {
        $(".discount-num-cont .price-img2").html(GetPriceInHTML(productData["price_formatted"]));
        $(".discount-num-cont .money-sign").html(GetCurrencyString(productData["currency"], "full"));
        $("#discount-line").css("visibility", "hidden");
        $(".discount-num-cont .head").html("Цена");
    }
    if (clicked == 0) {
        $(".container-arrows-past").css("visibility", "hidden");
    } else {
        $(".container-arrows-past").css("visibility", "visible");
    }
} // SetNewPrice

function InitBonuses()
{
    console.log("[InitBonuses] bonusesData = " + bonusesData + " | bonusesInited = " + bonusesInited);
    if (typeof bonusesData == "undefined")
    {
        return;
    }
    if (bonusesInited) {
        return;
    }
    bonusesInited = true;
    $("#game-bonus-buttons .buttons-wrapper").html("");

    $(".popup-socials .buttons-wrapper-facebook").html("");
    $(".popup-socials .buttons-wrapper-twitter").html("");
    $(".popup-socials .buttons-wrapper-google").html("");

    var countOfInitedBonuses = 0;

    // set up not used bonuses
    for (var key in bonusesData) {
        if (bonusesData[key]["used"] == false) {

            console.log("countOfInitedBonuses = " + countOfInitedBonuses);
            if (countOfInitedBonuses < 3 && socNetworkStatuses[bonusesData[key]["network"]] == true) {
                console.log("init bonus on game page");
                window["InitBonus_" + key](bonusesData[key], ""); // init on game page
            }

            window["InitBonus_" + key](bonusesData[key], "bonuses"); // init on bonuses page
            countOfInitedBonuses++;
        }
    } // for

    //console.log("countOfInitedBonuses = " + countOfInitedBonuses);
    //console.log("all additionalBonusesValue = " + additionalBonusesValue);

    if (additionalBonusesValue > 0) {
        $("#more-bonuses-button .bonus-par").html("+ " + additionalBonusesValue);
    } else {
        $("#more-bonuses-button").hide();
    }

    if (!facebookInited)
    {
        InitFacebook();
        facebookInited = true;
    }

    // bind bonuses buttons
    $(".soc-sec-1").mouseenter(function () {
        $(this).find(".soc-sec-inside").animate({
            opacity: 0.0,
            left: "-150px"
        }, 500, function () {
            // Animation complete.
            $(this).siblings(".soc-button-content").css("visibility", "visible");
        });
    });
    $(".soc-sec-1").mouseleave(function () {
        $(this).find(".soc-sec-inside").animate({
            opacity: 1.0,
            left: "0px"
        }, 500, function () {
            // Animation complete.
            $(this).siblings(".soc-button-content").css("visibility", "hidden");
            $(this).clearQueue();
        });
    });
} // InitBonuses

function InitLuckyButton()
{
    console.log("[InitLuckyButton]");
    //$("#screen_game .main-button").prop('disabled', false);

    if (userData["balance"] < 1) {
        $("#main-button").off('click');
        $("#main-button").fadeOut(1000);

        $(".num-fly-cont .clicks-description").html(i18n.t("interface.nonavailable-clicks"));

        setTimeout(ShowNoClicksAction, 2000);
        return;
    }

    $("#main-button").off('click');
    $("#main-button").on('click', function (e) {
        console.log("LuckyButton click");
        e.preventDefault();
        GetNewPrice();
    });

    if (clicked == 0) {
        //$(".takebuttonsection .takebutton").html("ПОЛУЧИТЬ СКИДКУ");
    } else {
        $(".takebuttonsection .takebutton").html(i18n.t("interface.lucky-button"));
    }
} // InitLuckyButton

function ShowNoClicksAction()
{
    var element = $("#game-bonus-buttons .divblock-bubble");
    var times = 3;
    var distance = "20px";
    var speed = 200;
    console.log("element = " + element);

    for (i = 0; i < times; i++) {
        console.log("element i = " + i);
        element.animate({"top": '-=' + distance}, speed)
            .animate({"top": '+=' + distance}, speed);
    }

}

function GetNewPrice()
{
    console.log("[GetNewPrice] start");
    $("#main-button").off('click');
    RestApiGet("/click.json/" + userData["skey"] + "/" + productData["id"], onNewPriceSuccess, onNewPriceError);
} // GetNewPrice

function onNewPriceSuccess(data)
{
    console.log("data: %o", data)
    console.log( "new price = " + data["productData"]["new_price"] );
    // update vars
    productData = data["productData"];
    userData = data["userData"];

    clicked++;

    $("#main-button").on('click', function(e) {
        console.log("LuckyButton click");
        e.preventDefault();
        GetNewPrice();
    });
    setTimeout(ShowClickData, 400);
}

function onNewPriceError(errorCode)
{
    alert("get new price error ["+errorCode+"]");
}

function ShowClickData()
{
    SetClicks();
    SetNewPrice();
    InitLuckyButton();

    // arrow
    if (lastPrice > productData["new_price"]) {
        // green
        $(".decription-percent .paragr").html(i18n.t("interface.price-decreased"));
        $(".container-arrows-past img").attr("src", "images/arrow-down.svg");
    } else {
        // red
        $(".decription-percent .paragr").html(i18n.t("interface.price-increased"));
        $(".container-arrows-past img").attr("src", "images/arrow-up.svg");
    }
    lastPrice = productData["new_price"];
}

function TakeCoupon()
{
    $("#screen_game .take-coupon-button").off('click');

    if (userData["registered"] == 0) {
        loginMode = "forcoupon";
        loginAction = "TakeCoupon";
        ShowScreen("login");
        return;
    }

    RestApiGet("/coupon.json/" + userData["skey"] + "/" + productData["id"], onGetCouponSuccess, onGetCouponError);
} // TakeCoupon

function onGetCouponSuccess(data)
{
    console.log("data: %o", data)
    // update vars
    productData = data["productData"];
    userData = data["userData"];
    // coupon data
    couponData = data["couponData"];

    ShowScreen("coupon");
}

function onGetCouponError(errorCode)
{
    alert("get coupon error ["+errorCode+"]");
}

// ***** LOGIN *****

function Init_login()
{
    console.log("Init_login | mode = " + loginMode);
    if (loginMode == "socialonly")
    {
        $("#screen_login .description-login").html("Выполнив вход, вы сможете сохранять свой баланс и иметь личный кабинет с настройками");
        $(".login-div").fadeIn(200);
        $(".div-mail-login").hide();
    } else if (loginMode == "forcoupon")
    {
        $("#screen_login .description-login").html("Для получения купона выполните вход. Вы сможете сохранять свой баланс и иметь личный кабинет с настройками");
        $(".login-div").fadeIn(200);
        $(".div-mail-login").show();
    }
    //InitBackButton("screen_login");
} // Init_game


function uLoginCallback(token){
    $.getJSON("//ulogin.ru/token.php?host=" +
        encodeURIComponent(location.toString()) + "&token=" + token + "&callback=?",
        function(data)
        {
            data = $.parseJSON(data.toString());
            if(!data.error)
            {
                console.log("Привет, "+data.first_name+" "+data.last_name+"!");
                RegisterUser(token, data);
            }
        }
    );
} // uLoginCallback

function RegisterUser(token, data)
{
    var request_data = new Object;
    request_data["skey"] = userData["skey"];
    request_data["token"] = token;
    request_data["identity"] = data["identity"];
    request_data["first_name"] = data["first_name"];
    request_data["last_name"] = data["last_name"];
    request_data["email"] = data["email"];
    request_data["photo"] = data["photo"];

    console.log("request_data: %o ", request_data);
    console.log("JSON.stringify(request_data) = " + JSON.stringify(request_data));

    var jsonData = JSON.parse(JSON.stringify(request_data))
    var requesrUrl = restApiUrl + apiVersion + "/user/auth.json";
    //console.log("postData = " + postData);
    console.log("jsonData: %o", jsonData);
    console.log("requesrUrl = " + requesrUrl);
    $.ajax({
        type: "POST",
        dataType: "json",
        data: request_data,
        url: requesrUrl,
        success: function(data){
            console.log("data: %o", data)
            console.log( "user name = " + data["userData"]["name"] );

            userData = data["userData"];

            UserIsRegistered();
        }
    });
} // RegisterUser

function UserIsRegistered()
{
    InitLoginButton();
    // apply login action
    switch(loginAction) {
        case "back":
            //ShowPreviousScreen();
            $(".login-div").fadeOut(200);
            break;
        case "TakeCoupon":
            TakeCoupon();
            break;
        default:
            console.log("[UserIsRegistered] loginAction not recognized. loginAction = " + loginAction);
            $(".login-div").fadeOut(200);
            //ShowPreviousScreen();
    }
} // UserIsRegistered

// ***** COUPON *****
function Init_coupon()
{
    console.log("Init_coupon");

    $("#game-wrapper").fadeOut(100);

    $( "#coupon-wrapper").show().css("opacity", "0");
    $( "#coupon-wrapper" ).animate({
        opacity: 1.0,
        scale:1.0
    }, 500, function() {
        // Animation complete.
    });

    $("#coupon-wrapper .discountpercents").html(couponData["product_discount"]);
    if (couponData["code_formatted"] == "byemail")
    {
        $("#coupon-wrapper .code .frames").html(i18n.t("interface.sent-on-email"));
    } else {
        $("#coupon-wrapper .code .frames").html(couponData["code_formatted"]);
    }

    if (typeof(couponData["valid_till"]) == "undefined")
    {
        $("#coupon-wrapper .coupon-valid").html("");
        $("#coupon-wrapper .coupon-valid-date").html("");
    } else {
        $("#coupon-wrapper .coupon-valid-date").html(couponData["valid_till"]);
    }

    $("#coupon-wrapper .product-name").html(productData["name"]);
    $("#coupon-wrapper .originalprice").html(GetPriceInHTML(productData["price_formatted"], productData["currency"]));
    $("#coupon-wrapper .newprice").html(GetPriceInHTML(couponData["product_price_formatted"], productData["currency"]));
    //$("#coupon_product_discount").html(couponData["product_discount"] + "%");
    $("#coupon-wrapper .shopname").html(shopData["name"]);

    $('#order_name').val(userData["name"]);
    $('#order_email').val(userData["email"]);
    $('#order_phone').val(userData["phone"]);

    $('#order-form').on('submit', function(e) {
        e.preventDefault();  //prevent form from submitting
        //var data = $("#login_form :input").serializeArray();
        //console.log(data); //use the console for debugging, F12 in Chrome, not alerts
        UseCouponNow();
    });
} // Init_coupon

function UseCouponNow()
{
    var request_data = new Object;
    request_data["skey"] = userData["skey"];
    request_data["phone"] = $('#order_phone').val();
    request_data["email"] = $('#order_email').val();
    request_data["name"] = $('#order_name').val();

    console.log("request_data: %o ", request_data);
    console.log("JSON.stringify(request_data) = " + JSON.stringify(request_data));

    var requesrUrl = restApiUrl + apiVersion + "/coupon/usenow.json";
    console.log("requesrUrl = " + requesrUrl);
    $.ajax({
        type: "POST",
        dataType: "json",
        data: request_data,
        url: requesrUrl,
        success: function(data, textStatus, xhr){
            console.log("data: %o", data)
            console.log( "user name = " + data["userData"]["name"] );

            userData = data["userData"];

            ShowSuccessOrder();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("oups... error...");
            console.log("jqXHR = " + jqXHR);
            console.log("textStatus = " + textStatus);
            console.log("errorThrown = " + errorThrown);
        }
    });
}

function UseCouponByEmail()
{
    var userEmail = $('#email-3').val();
    RestApiGet("/coupon/sendbyemail.json/"+userData["skey"]+"/"+userEmail+"/"+productData["id"], onSendByEmailSuccess, onSendByEmailError);
}

function onSendByEmailSuccess(data)
{
    // update vars
    productData = data["productData"];
    userData = data["userData"];
    // coupon data
    couponData = data["couponData"];

    ShowScreen("coupon");
}

function onSendByEmailError(errorCode)
{
    if (code == 204)
    {
        alert(i18n.t("errors.error") + " " + i18n.t("errors.email-not-valid"));
    } else {
        alert(i18n.t("errors.error") + " " + i18n.t("errors.unknown"));
    }
    $('#email-form').fadeOut(100);
    setTimeout(function(){$('#email-form').fadeIn(500);}, 1000);
}

function ShowSuccessOrder()
{
    console.log("ShowSuccessOrder");
    $(".take-div").fadeOut(100);
    $("#fake-button-for-anim").trigger("click");

    setTimeout(function(){
        ShowSuccessScreen();
    }, 3000);

}

function ShowSuccessScreen()
{
    $( "#coupon-wrapper").fadeOut(300);
    $( ".popup-gameover").fadeIn(300);
    $( document.body ).css("background-color", "rgba(15, 26, 33, 0.9)");
}

// ***** NOCLICKS *****
function Init_noclicks()
{
    console.log("Init_noclicks");

    // TODO: bind buttons
} // Init_noclicks


/*!
 * ----------------------------------------------------------------------
 * --== BONUSES ==--
 * ----------------------------------------------------------------------
 */
function AddButtonToBonuses(bonusData, placement) {
    //var button = '<div class="w-col w-col-3 social-column"><div class="social-button-footer"><img class="main-button-icon" src="" width="16" alt=""><span class="social-button-link">NAME</span></div><span class="l1">+100500 кликов</span></div>';
    var button = '<div class="soc-sec-1" data-ix="new-interaction"><div class="w-clearfix soc-sec-inside"><img class="social-ico" src="" width="40" alt=""><div class="bonus-par">+ 10</div></div><div class="soc-button-content"></div></div>';
    if (placement == "bonuses") {
        button = '<div><div class="soc-button-content" style="visibility:visible"></div></div>';
    }
    if (socNetworkStatuses[bonusData["network"]] == false)
    {
        button = '<div><div class="soc-button-content sbc-disabled" style="visibility:visible"></div></div>';
    }
    var buttonElement = $('<div/>').html(button).contents();
    if (placement == "bonuses") {
        console.log("appendTo ["+".popup-socials .buttons-wrapper-" + bonusData["network"]+"]")
        buttonElement.appendTo(".popup-socials .buttons-wrapper-" + bonusData["network"]);
    } else {
        console.log("appendTo ["+"#game-bonus-buttons .buttons-wrapper"+"]")
        buttonElement.appendTo("#game-bonus-buttons .buttons-wrapper");
    }
    return buttonElement;
}

function InitBonus_shop_fb_like(bonusData, placement) {
    var button = AddButtonToBonuses(bonusData, placement);
    button.attr({ "id": "shop_fb_like" });
    if (socNetworkStatuses[bonusData["network"]] == true)
    {
        $(button).find(".soc-button-content").html("<fb:like href='" + bonusData["url"] + "' class='fb-like' layout='button' action='like' show_faces='false' share='false' style='margin-left: auto; margin-right: auto'></fb:like>");
    } else {
        $(button).find(".soc-button-content").html("<img src='images/soc/fb_like_disabled.png'>");
    }
    $(button).find(".bonus-par").html("+" + bonusData["value"] + "");
    $(button).find(".social-ico").attr("src", "images/soc-fb.svg");
    $(button).find(".soc-button-content").css("top", "-40px");

    if (placement == "bonuses") {
        additionalBonusesValue += bonusData["value"];
    }
    if (typeof FB != "undefined")
    {
        console.log("FB.XFBML.parse");
        FB.XFBML.parse();
    }
} // InitBonus_shop_fb_like

function InitBonus_shop_fb_share(bonusData, placement) {
    var button = AddButtonToBonuses(bonusData, placement);
    button.attr({ "id": "shop_fb_share" });

    if (socNetworkStatuses[bonusData["network"]] == true)
    {
        $(button).find(".soc-button-content").html("<img src='images/soc/fb_share_button.png'/>");
    } else {
        $(button).find(".soc-button-content").html("<img src='images/soc/fb_share_disabled.png'/>");
    }
    $(button).find(".bonus-par").html("+" + bonusData["value"] + "");
    $(button).find(".social-ico").attr("src", "images/soc-fb.svg");
    $(button).find(".soc-button-content").css("top", "-40px");

    if (placement == "bonuses") {
        additionalBonusesValue += bonusData["value"];
    }

    $('#shop_fb_share').unbind("click");
    if (socNetworkStatuses[bonusData["network"]] == true)
    {
        $('#shop_fb_share').bind("click", function () {
            FB.ui(
                {
                    method: 'feed',
                    name: 'Выиграть скидку очень легко',
                    link: bonusesData["shop_fb_share"]["url"],
                    picture: 'http://macsimum.com.ua/image/cache/data/accessories/appletvf-340x340.jpg',
                    caption: 'Приставка Apple TV 3 (MD199)',
                    description: 'Описание Apple TV New (MD199 LL/A) ИЛИ ЛЮБОЕ ДРУГОЕ'
                },
                function (response) {
                    console.log('SHARE response');
                    if (response && response.post_id) {
                        console.log('Post was published. ' + response.post_id);
                        ApplyPromoBonuses("Facebook", "share", bonusesData["shop_fb_share"]["url"]);
                    } else {
                        console.log('Post was not published.');
                        alert(i18n.t("errors.error") + " " + i18n.t("errors.unknown"));
                    }
                }
            );
        });
    }
} // InitBonus_shop_fb_share

function InitBonus_vk_subscribe(placement) {
    /*
    console.log("[InitBonus_vk_subscribe]");
    var button = AddButtonToBonuses(placement);
    button.attr({ "id": "vk_subscribe" });

    $(button).find(".soc-button-content").html("<div id='vk_subscribe' style='margin-left: auto; margin-right: auto'></div><script type='text/javascript'>VK.Widgets.Subscribe('vk_subscribe', {mode: 0, soft: 1, width: 100}, " + bonusesData["shop_vk_subscribe"]["subscribe_id"] + ");</script>");
    //$(button).find(".soc-button-content").html("<button id='vk_subscribe' style='margin-left: auto; margin-right: auto' onclick='DoSocialAction(\"vkontakte\", \"vk_subscribe\")'>VK SUBSCRIBE</button>");
    $(button).find(".bonus-par").html("+" + bonusesData["vk_subscribe"]["value"] + "");
    $(button).find(".social-ico").attr("src", "images/soc-vk.svg");
    $(button).find(".soc-button-content").css("top", "-40px");
    $(button).find(".soc-button-content").css("left", "-50px");

    if (placement == "bonuses") {
        additionalBonusesValue += bonusesData["vk_subscribe"]["value"];
    }

    VK.Observer.subscribe("widgets.subscribed", function (count) {
        console.log("vk_subscribe |  count = " + count);
        ApplyPromoBonuses("VK", "subscribe", bonusesData["shop_vk_subscribe"]["subscribe_id"]);
    });

    VK.Observer.subscribe("widgets.unsubscribed", function (count) {
        console.log("vk_UNsubscribe |  count = " + count);
        ApplyPromoBonuses("VK", "unsubscribe", bonusesData["shop_vk_subscribe"]["subscribe_id"]);
    });
    */
} // InitBonus_shop_vk_subscribe

function InitBonus_vk_like(placement) {
    /*
    console.log("[InitBonus_vk_like]");
    var button = AddButtonToBonuses(placement);
    button.attr({ "id": "vk_like" });

    $(button).find(".soc-button-content").html("<div id='vk_like'></div><script type='text/javascript'>VK.Widgets.Like('vk_like', {type: 'button', width: '100', pageUrl: '" + bonusesData["shop_vk_like"]["url"] + "'});</script>");
    //$(button).find(".soc-button-content").html("<button id='vk_like' style='margin-left: auto; margin-right: auto' onclick='DoSocialAction(\"vkontakte\", \"vk_like\")'>VK LIKE</button>");
    $(button).find(".bonus-par").html("+" + bonusesData["vk_like"]["value"] + "");
    $(button).find(".social-ico").attr("src", "images/soc-vk.svg");
    $(button).find(".soc-button-content").css("top", "-40px");
    $(button).find(".soc-button-content").css("left", "-60px");

    if (placement == "bonuses") {
        additionalBonusesValue += bonusesData["vk_like"]["value"];
    }

    VK.Observer.subscribe("widgets.like.liked", function (count) {
        console.log("vk_like |  count = " + count);
        ApplyPromoBonuses("VK", "like", bonusesData["shop_vk_like"]["url"]);
    });

    VK.Observer.subscribe("widgets.like.unliked", function (count) {
        console.log("vk_UNlike |  count = " + count);
        ApplyPromoBonuses("VK", "unlike", bonusesData["shop_vk_like"]["url"]);
    });
    */
} // InitBonus_shop_vk_like

function InitBonus_shop_vk_share() {
    /*
     console.log("[InitBonus_shop_vk_share]");
     var button = AddButtonToBonuses();
     button.attr({ "id" : "shop_vk_share" });
     var code = VK.Share.button({url: bonusesData["shop_vk_share"]["url"], title: shopData["name"], description: '', image: productData["product_image"], noparse: true }, {type: 'round_nocount',  text: "Поделиться"});
     //console.log("[InitBonus_shop_vk_share] code = " + code);

     var pageuri = bonusesData["shop_vk_share"]["url"];

     $( button ).find(".social-button-link").html(code);
     $( button ).find(".l1").html("+" + bonusesData["shop_vk_share"]["value"] + " кликов");
     */
    /*
     VK.Observer.subscribe("widgets.like.shared", function(count)
     {
     console.log("vk_share |  count = " + count);
     ApplyPromoBonuses("VK", "share", bonusesData["shop_vk_share"]["url"]);
     });
     */
    /*
     VK.Share.count = function(index, count){
     // вставляем в DOM
     console.log("vk_share | index = " + index + " |  count = " + count);
     };
     */

    //var path = 'http://vkontakte.ru/share.php?act=count&index=1&url=' + pageuri + '&format=json&callback=?';
    //console.log("path = " + path);
    //$.getJSON(path);
} // InitBonus_shop_vk_share

function InitBonus_shop_twitter_follow(bonusData, placement) {
    console.log("[InitBonus_shop_twitter_follow]");
    var button = AddButtonToBonuses(bonusData, placement);
    button.attr({ "id": "shop_twitter_follow" });
    var button_content = "<a href='" + bonusData["key"] + "' class='twitter-follow-button' data-show-count='false' data-lang='en'>Follow " + shopData["name"] + "</a>";

/*
        window.twttr = function (d, s, id) {
            var t, js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);
            js.id = id;
            js.src = "//platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);
            return window.twttr || (t = { _e: [], ready: function (f) {
                t._e.push(f)
            } });
        }(document, "script", "twitter-wjs");
*/
    if (typeof window.twttr == "undefined")
    {
        !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
    }

    if (socNetworkStatuses[bonusData["network"]] == true)
    {
        $(button).find(".soc-button-content").html(button_content);
    } else {
        $(button).find(".soc-button-content").html("<img src='images/soc/twitter_follow_disabled.png'/>");
    }
    $(button).find(".bonus-par").html("+" + bonusData["value"] + "");
    $(button).find(".social-ico").attr("src", "images/soc-tw.svg");
    $(button).find(".soc-button-content").css("top", "-40px");

    if (placement == "bonuses") {
        additionalBonusesValue += bonusData["value"];
    }

    console.log("twitter value = " + bonusData["value"]);
    console.log("twitter additionalBonusesValue = " + additionalBonusesValue);

    if (socNetworkStatuses[bonusData["network"]] == true && typeof window.twttr != "undefined")
    {
        twttr.widgets.load();

        window.twttr.ready(function (twttr) {
            console.log('TWITTER READY' + twttr);
            twttr.events.bind('follow', function (event) {
                console.log("shop_twitter_follow CALLBACK");
                console.log(event);
                var followed_user_id = event.data.user_id;
                var followed_screen_name = event.data.screen_name;
                ApplyPromoBonuses("Twitter", "follow", bonusData["key"]);
            });
            twttr.events.bind('unfollow', function (event) {
                console.log("shop_twitter_UNfollow CALLBACK");
                console.log(event);
                ApplyPromoBonuses("Twitter", "unfollow", bonusData["key"]);
            });
            /*
            twttr.events.bind('loaded', function (event) {
                event.data.widgets.forEach(function (widget) {
                    console.log("[TWITTER] Created widget", widget.id);
                });
            });
            */
        });
    }
} // InitBonus_shop_twitter_follow

function InitBonus_shop_google_plus1(bonusData, placement) {
    console.log("[InitBonus_shop_google_plus1]");
    var button = AddButtonToBonuses(bonusData, placement);
    button.attr({ "id": "shop_google_plus1" });
    var button_content = "<g:plusone href='" + bonusData["key"] + "' size='standard' annotation='none' recommendations='false' callback='shop_google_plus1_callback' onendinteraction='shop_google_plus1_onend'></g:plusone>";

    window.___gcfg = {
        lang: 'en-US'
    };

    (function () {
        var po = document.createElement('script');
        po.type = 'text/javascript';
        po.async = true;
        po.src = 'https://apis.google.com/js/plusone.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(po, s);
    })();

    if (socNetworkStatuses[bonusData["network"]] == true)
    {
        $(button).find(".soc-button-content").html(button_content);
    } else {
        $(button).find(".soc-button-content").html("<img src='images/soc/google_plus1_disabled.png'/>");
    }
    $(button).find(".bonus-par").html("+" + bonusData["value"] + "");
    $(button).find(".social-ico").attr("src", "images/soc-gplus.svg");
    $(button).find(".soc-button-content").css("top", "-40px");
    $(button).find(".soc-button-content").css("left", "-4px");

    if (placement == "bonuses") {
        additionalBonusesValue += bonusData["value"];
    }

} // InitBonus_shop_google_plus1

function shop_google_plus1_callback(json_result) {
    console.log("[shop_google_plus1_callback] json_result = " + json_result);
    console.log("json_result.state = " + json_result.state);

    ApplyPromoBonuses("Google", "plus1", bonusesData["shop_google_plus1"]["key"]);
}

function shop_google_plus1_onend(json_result) {
    console.log("[shop_google_plus1_onend] json_result = " + json_result);
    console.log("json_result.type = " + json_result.type);

}


function DoSocialAction(name, bonus_name)
{
    RestApiGet("/socials/social_action.json/"+userData["skey"]+"/"+name+"/"+bonus_name, onSocialActionSuccess, onSocialActionError)
}

function onSocialActionSuccess(data)
{
    console.log("[onSocialActionSuccess] data: %o", data)
    if (typeof data["error"] != 'undefined') {
            if (data["error"]["error_code"] == 17)
            {
                /*
                var oScript = document.createElement("script");
                oScript.type = "text";
                oScript.src = data["error"]["redirect_uri"];
                oScript.onload = VKVerifLoaded(oScript);
                document.head.appendChild(oScript);
                console.log("onSocialActionSuccess | " + oScript.src);
                */
                /*
                $.ajax({
                    url: data["error"]["redirect_uri"],
                    beforeSend: function( xhr ) {
                        xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
                    }
                })
                .done(function( data ) {
                    if ( console && console.log ) {
                        console.log( "Sample of data:", data );
                    }
                });
                */

                /*
                ifrm = document.createElement("IFRAME");
                ifrm.setAttribute("src", data["error"]["redirect_uri"]);
                ifrm.setAttribute("id", "vk_auth_iframe_id");
                ifrm.style.width = 640+"px";
                ifrm.style.height = 480+"px";
                document.body.appendChild(ifrm);

                $("#vk_auth_iframe_id").load(function(){
                    console.log("on iframe loaded = " + $(this).attr("src"));
                });
                 */

                var vk_verif_popup = window.open(data["error"]["redirect_uri"],'vk_verif_popup','width=700,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
                setTimeout(function(){
                    console.log("vk_verif_popup.location.href = " + vk_verif_popup.location.href);
                }, 6000);

            }
    }
}

function onSocialActionError(errorCode)
{
    alert("social action error ["+errorCode+"]");
}

function VKVerifLoaded(s)
{
    console.log("VKVerifLoaded | " + s.src);
}



function ApplyPromoBonuses(type, action, key) {
    var request_data = new Object;
    request_data["skey"] = userData["skey"];
    request_data["type"] = type;
    request_data["action"] = action;
    request_data["key"] = key;

    console.log("request_data: %o ", request_data);
    console.log("JSON.stringify(request_data) = " + JSON.stringify(request_data));

    var requesrUrl = restApiUrl + apiVersion + "/bonuses/applypromobonuses.json";
    console.log("requesrUrl = " + requesrUrl);
    $.ajax({
        type: "POST",
        dataType: "json",
        data: request_data,
        url: requesrUrl,
        success: function (data) {
            console.log("data: %o", data)
            console.log("user balance = " + data["userData"]["balance"]);

            userData = data["userData"];

            SetClicks();

            if (userData["balance"] > 0) {
                $("#main-button").fadeIn(500);

                $(".num-fly-cont .clicks-description").html(i18n.t("interface.available-clicks"));

                $("#main-button").off('click');
                $("#main-button").on('click', function (e) {
                    console.log("LuckyButton click");
                    e.preventDefault();
                    GetNewPrice();
                });

                bonusesInited = false;
                bonusesData = data["bonuses"];

                // remove used bonuses
                for (var key in bonusesData) {
                    if (bonusesData[key]["used"] == true) {
                        $("#" + key + " .soc-button-content").css("visibility", "hidden");
                        $("#" + key + " .soc-button-content").css("opacity", 0);
                        $("#" + key + " .soc-sec-inside").css("left", "0px");
                        $("#" + key).off("mouseenter");
                        $("#" + key).off("mouseleave");
                        $("#" + key).css("opacity", 0.3);
                    }
                } // for

                //InitBonuses();
            }
        }
    });
} // ApplyPromoBonuses


/*!
* ----------------------------------------------------------------------
* close
* ----------------------------------------------------------------------
*/
$('.main-closebutton').on('click', function(e) {
  e.preventDefault();
  parent.postMessage("closeWidget", "*");
});


/*!
 * ----------------------------------------------------------------------
 * --== FACEBOOK ==-
 * ----------------------------------------------------------------------
 */

function InitFacebook() {
    console.log("InitFacebook");
    window.fbAsyncInit = function () {
        // init the FB JS SDK
        FB.init({
            appId: '496062160512252',                        // App ID from the app dashboard
            status: true,                                 // Check Facebook Login status
            xfbml: true                                  // Look for social plugins on the page
        });

        FB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
                //var uid = response.authResponse.userID;
                //var accessToken = response.authResponse.accessToken;
                set_login_status("facebook", true);
            } else if (response.status === 'not_authorized') {
                set_login_status("facebook", true);
            } else {
                // the user isn't logged in to Facebook.
            }
        });

        console.log("edge.create subscribed");
        // Additional initialization code such as adding Event Listeners goes here
        FB.Event.subscribe('edge.create',
            function (href, widget) {
                console.log("liked URL " + href);
                //_gaq.push(['_trackEvent', 'ClicksProduct', 'FacebookLike', href]);

                // TODO: show LP bonuses animation

                // save bonuses in account
                ApplyPromoBonuses("Facebook", "like", href);
            }
        );

        FB.Event.subscribe('edge.remove',
            function (href, widget) {
                console.log("UNliked URL " + href);
                // remove LP bonuses
                //_gaq.push(['_trackEvent', 'ClicksProduct', 'FacebookUNLike', href]);

                // remove bonuses from account
                ApplyPromoBonuses("Facebook", "unlike", href);
            }
        );
    };

    // Load the SDK asynchronously
    (function () {
        // If we've already installed the SDK, we're done
        if (document.getElementById('facebook-jssdk')) {
            return;
        }

        // Get the first script element, which we'll use to find the parent node
        var firstScriptElement = document.getElementsByTagName('script')[0];

        // Create a new script element and set its id
        var facebookJS = document.createElement('script');
        facebookJS.id = 'facebook-jssdk';

        // Set the new script's source to the source of the Facebook JS SDK
        facebookJS.src = '//connect.facebook.net/en_US/all.js';

        // Insert the Facebook JS SDK into the DOM
        firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);
    }());
} // InitFacebook

/*
 *
 *  *** REST GET REQUEST ***
 *
 */

function RestApiGet(uri, onSuccess, onError)
{
    var requesrUrl = restApiUrl + apiVersion + uri;
    console.log( "[RestApiGet] requesrUrl = " + requesrUrl );
    $.ajax({
        type: "GET",
        dataType: "json",
        url: requesrUrl,
        success: function(data, textStatus, xhr){
            console.log("[RestApiGet] [success] xhr.status = " + xhr.status);
            console.log("[RestApiGet] [success] xhr.statusText = " + xhr.statusText);
            console.log("[RestApiGet] [success] xhr.readyState = " + xhr.readyState);
            console.log("[RestApiGet] [success] data: %o", data)
            if (typeof(data) == "undefined")
            {
                if (xhr.status == 204)
                {
                    onError(xhr.status);
                } else {
                    onError(-1);
                }
            } else {
                onSuccess(data);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("[RestApiGet] [error] jqXHR = " + jqXHR);
            console.log("[RestApiGet] [error] textStatus = " + textStatus);
            console.log("[RestApiGet] [error] errorThrown = " + errorThrown);
            onError(jqXHR.status);
        }
    });
} // RestApiGet


/*
 *
 * VK APP
 *
 */

function VKAuth()
{
    var redirectUrl = apiUrl+apiVersion+"/vk_app/auth.html";
    var vkOauthUrl = "https://oauth.vk.com/authorize?client_id="+vk_app_id+"&scope=friends,wall,groups,email&redirect_uri="+encodeURIComponent(redirectUrl)+"&display=popup&v=5.23&response_type=token";
    //$("#VKAppWrapper").html("<iframe id='vk_auth_iframe' src='"+vkOauthUrl+"' width='100%' height='100%' style='padding:0; margin:0'></iframe>");
    var vk_auth_popup = window.open(vkOauthUrl,'vk_auth_popup','width=700,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
}

function VKAuthCallback(answer)
{
    console.log("[VKAuthCallback] answer = " + answer)
    var uriHash = answer;
    if (uriHash.indexOf("#") > -1)
    {
        uriHash = uriHash.substring(1);
    }
    // access_token=43b880628eacf38b0a6874ee2053b25924931936c75db43ebae3f63cfdd5e574295e9c15d4e649905b765&expires_in=86400&user_id=6432321
    var uriParts = uriHash.split("&");
    var access_token = uriParts[0].split("=")[1];
    var expires_in = uriParts[1].split("=")[1];
    var user_id = uriParts[2].split("=")[1];
    console.log("access_token = " + access_token);
    console.log("expires_in = " + expires_in);
    console.log("user_id = " + user_id);

    RestApiGet("/user/vk_access.json/" + userData["skey"] + "/" + access_token + "/" + expires_in + "/" + user_id, onVkAccessSuccess, onVkAccessError);
} // VKAuthCallback

function onVkAccessSuccess(data)
{
    userData = data["userData"];
    bonusesData = data["bonuses"];

    // update clicks counter
    SetClicks();

    // update bonuses

    // update bonuses page

}

function onVkAccessError(errorCode)
{
    console.log("vk access server error. errorCode = " + errorCode);
}

/*
*
* UTILS
*
 */

function GetPriceInHTML(price, currency)
{
    if (price.indexOf(".") > 0)
    {
        var parts = price.split(".", 2);
        price = parts[0] + "<sup>"+parts[1]+"</sup>";
    }
    if (typeof currency == 'undefined')
    {
        return price;
    }
    if (currency == "USD")
    {
        return "$" + price;
    }
    if (currency == "UAH")
    {
        return price + " грн.";
    }
    return price;
} // GetPriceInHTML

function GetCurrencyString(currency, size)
{
    size = typeof size !== 'undefined' ? size : "short";
    if (currency == "USD")
    {
        return "$";
    }
    if (currency == "UAH")
    {
        if (size == "full")
        {
            return "гривен";
        }
        return "грн.";
    }
    return "";
} // GetCurrencyString