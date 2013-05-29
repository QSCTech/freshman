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
        html = html.replace(/<p>@@[ ]*([^<]+)<\/p>/g, '<div class="hide-elem"><div class="hide-elem-title">$1</div><div class="hide-elem-content">');
        html = html.replace(/<p>@@<\/p>/g, '</div></div>');
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
        $(this).next().css('margin-top', 0);
        if($(this).attr('data-id') == 0) {
            //            $(this).nextUntil("h2").andSelf().show(800);
            // 不该包括 h2
            $(this).nextUntil("h2").show(0);
        } else {
            $(this).nextUntil("h2").hide(0);
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
//    $('#wrap').css('margin-top', -height);
    $('#top').css('height', height - 20);
    $('#text').css('margin-top', height / 2 - 180);
    $('#markdown').css('width', width - 350 - 50);
    $('#bottom').css('min-height', height - 30);

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
    $('#markdown').on('click', '.hide-elem-title', function() {
        $(this).parent().find('.hide-elem-content').each(function() {
            if($(this).is(":visible")) {
                $(this).slideUp();
            } else {
                $(this).slideDown();
            }
        });
    });
    $('#article').on('click', '.nav', function() {
        $('#left .current').removeClass('current');
        $(this).addClass('current');
        var id = $(this).attr('data-id');
        // $('#markdown h2').each(function() {
        //     if($(this).attr('data-id') == id) {
        //         $(this).nextUntil("h2").fadeIn(800);
        //     } else {
        //         $(this).nextUntil("h2").fadeOut(800);
        //     }
        // });
        $('#markdown h2').each(function() {
            if($(this).attr('data-id') == id) {
                //
            } else {
                $(this).nextUntil("h2").fadeOut(400);
            }
        });
        setTimeout(function() {
            $('#markdown h2').each(function() {
                if($(this).attr('data-id') == id) {
                    $(this).nextUntil("h2").fadeIn(400);
                } else {
                    //
                }
            });
        }, 800);
    });
    changePage();
    $('#text').click(function() {
        $('body, html').animate({scrollTop: $(window).height()}, 2000);
    });
});