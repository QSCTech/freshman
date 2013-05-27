var color = '#000';
var changePage = function() {
    var page = data[0];
    color = page.color;

    loadArtilce(page.article);

    $('#footer').css({background: color});
    $('em').css({color: color});
    $('#left .current').css({color: page.color});
    $('#the-text').attr('src', 'img/'+page.text);
    $('#the-title').attr('src', 'img/'+page.title);
    $('#the-img').attr('src', 'img/'+page.img);

};

var loadArtilce = function(articles, nth) {
    if(!nth) nth = 0;
    var htmlNav = '',
        htmlText = '';
    for(var i=0; i<articles.length; i++) {
        var article = articles[i],
            title = article.title,
            subTitle = article.subTitle,
            text = article.text;
        htmlNav += i == 0 ? '<div class="title current">'+title+'</div>' : '<div class="title">'+title+'</div>';
        htmlNav += i == 0 ? '<div class="sub-title current">'+subTitle+'</div>' : '<div class="sub-title">'+subTitle+'</div>';
        htmlText += '<div class="text">'+text+'</div>';
    }
    $('#left').html(htmlNav);
    $('#right').html(htmlText);
};

var resizeHook = function() {
    var width = $(window).width(),
        height = $(window).height(),
        scale = width / height,
        imgScale = 988 / 570;

    $('#img').css('height', height);
    $('#wrap').css('margin-top', -height);
    $('#top').css('height', height - 20);
    $('#text').css('margin-top', height / 2 - 180);
    $('#right').css('width', width - 330);

    if(scale < imgScale) {
        $('#the-img').css({height: height, width: 'auto'});
    } else {
        $('#the-img').css({height: 'auto', width: width});
    }
};
resizeHook();
if (window.addEventListener) {
    window.addEventListener('resize', function() { resizeHook(); });
} else if (window.attachEvent) {
    // for ie
    window.attachEvent('resize', function() { resizeHook(); });
}

$(document).ready(function() {
    changePage();

    $('#text').click(function() {
        var h = $(window).height();
        var dom = document.getElementById('img');
        var func = (function(h, dom) {
            return function() {
                window.scroll(0, window.scrollY+2);
                var top = dom.style.top;
                top = top ? parseInt(top.replace(/px/g,'')) : 0;
                top += 2;
                dom.style.top = top + 'px';
                if(window.scrollY == h) {
                    dom.style.top = 0;
                    return;
                }
                setTimeout(arguments.callee, 2);
            };
        })(h, dom);
        setTimeout(func, 0);
    });
});