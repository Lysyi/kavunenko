/* ==========================================================
  Base Default JavaScript
  -- Table of Contents --
*/


// JS functions and initiations go here...

$( "#used-btn" ).click(function(e) {
  e.preventDefault();
  $( ".used-block" ).show( "slow" );
  $( ".coupon-content" ).fadeTo( "slow", 0.8 );
});

$( ".coupon-content" ).animate({
  top: -120
}, 1000 );


var lastWidth = 679;
var attempts = 7;

$( ".attempts" ).html( attempts );
$( ".one-more-btn" ).click(function(e) {
  $( ".attempts" ).html( attempts -= 1 );
});
$( ".add-click-btn" ).click(function(e) {
  $( ".attempts" ).html( attempts += 1 );
  $( ".attempts" ).animate({  borderSpacing: -360 }, {
    step: function(now,fx) {
      $(this).css('-webkit-transform','rotate('+now+'deg)'); 
      $(this).css('-moz-transform','rotate('+now+'deg)');
      $(this).css('transform','rotate('+now+'deg)');
    },
    duration:'50'
  },'linear');
});

if($( window ).width() <= lastWidth){
  $( ".main-basket-block" ).attr('style', 'top: -20px');
}
else {
  $( ".main-basket-block" ).animate({
    top: 50
  }, 1000 );
  $( ".one-more-btn" ).click(function(e) {
    e.preventDefault();
    $( ".attempts" ).animate({  borderSpacing: -360 }, {
      step: function(now,fx) {
        $(this).css('-webkit-transform','rotate('+now+'deg)'); 
        $(this).css('-moz-transform','rotate('+now+'deg)');
        $(this).css('transform','rotate('+now+'deg)');
      },
      duration:'50'
    },'linear');
    $( ".main-basket-block" ).animate({
      top: 180
    }, 500 );  
    $( ".main-basket-block" ).animate({
      top: 50
    }, 500 );  
  });
}

$( window ).resize(function(){
  if($( window ).width() <= lastWidth){
    $( ".main-basket-block" ).attr('style', 'top: -20px');
  }
  else {
    $( ".main-basket-block" ).attr('style', 'top: 50px');
  }
});
