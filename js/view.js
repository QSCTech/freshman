var color = '#000';
var changePage = function() {
    var page = data[0];
    color = page.color;

    // Note: <style> tag already has contents, coz less.js
    $('style').append('.theme, em, #left .current {color: '+color+';} #footer {background: '+color+';}');

    $('#the-text').attr('src', 'img/'+page.text);
    $('#the-title').attr('src', 'img/'+page.title);
    $('#the-img').attr('src', 'img/'+page.img);

    var md = page.md;
    $.get('md/'+md, function(data) {
        var html = markdown.toHTML(data);
        html = html.replace(/<p>@@[ ]*([^<]+)<\/p>/g, '<div class="hide-elem"><div class="hide-elem-title">$1</div>');
        html = html.replace(/<p>@@<\/p>/g, '</div>');
        $('#markdown').html(html);
        setTimeout(function() {
            parsePage();
        }, 100);
    });
};

var parsePage = function() {
    var title = $('#markdown h1').text();
    $('title').html('求是潮新生手册 - '+title);
    var i = 0,
        htmlNav = '';
    $('#markdown h2').each(function() {
        $(this).attr('data-id', i);
        var text = $(this).text(),
            titles = text.split(' —— '),
            title = titles[0],
            subTitle = titles[1] ? titles[1].replace(/ /g, '<br>') : '';
        htmlNav += i == 0 ? '<div class="nav current" data-id="'+i+'">' : '<div class="nav" data-id="'+i+'">';
        htmlNav += '<div class="title">'+title+'</div>';
        htmlNav += '<div class="sub-title">'+subTitle+'</div>';
        htmlNav += '</div>';
        ++i;
    });
    $('#left').html(htmlNav);
    $('#markdown h2').each(function() {
        if($(this).attr('data-id') == 0) {
            //            $(this).nextUntil("h2").andSelf().show(800);
            // 不该包括 h2
            $(this).nextUntil("h2").show(800);
        } else {
            $(this).nextUntil("h2").hide(800);
        }
    });
};


var resizeHook = function() {
    console.log("resize");
    var width = $(window).width(),
        height = $(window).height(),
        scale = width / height,
        imgScale = 988 / 570;

    $('#img').css('height', height);
    $('#wrap').css('margin-top', -height);
    $('#top').css('height', height - 20);
    $('#text').css('margin-top', height / 2 - 180);
    $('#right').css('width', width - 330);
    $('#bottom').css('min-height', height - 30 - 47);

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
    $('#article').on('click', '.nav', function() {
        $('#left .current').removeClass('current');
        $(this).addClass('current');
        var id = $(this).attr('data-id');
        $('#markdown h2').each(function() {
            if($(this).attr('data-id') == id) {
                $(this).nextUntil("h2").show(800);
            } else {
                $(this).nextUntil("h2").hide(800);
            }
        });
    });
    changePage();
    $('#text').click(function() {
        var h = $(window).height();
        var dom = document.getElementById('img');
        var func = (function(h, dom) {
            return function() {
                window.scroll(0, window.scrollY+1);
                var top = dom.style.top;
                top = top ? parseInt(top.replace(/px/g,'')) : 0;
                top += 1;
                dom.style.top = top + 'px';
                if(window.scrollY >= h) {
                    dom.style.top = 0;
                    return;
                }
                setTimeout(arguments.callee, 5);
            };
        })(h, dom);
        setTimeout(func, 0);
    });
});