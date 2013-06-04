var Doc = function(md) {

    var that = this,
        html = markdown.toHTML(md);
    // 匹配子题标
    html = html.replace(/<h2>(.*)——(.*) (.*)<\/h2>/g, "<h2>$1</h2><div class=\"sub-header\">$2<br>$3</div>");
    // 匹配折叠
    html = html.replace(/<p>@@[ ]*([^<]+)<\/p>/g, '<div class="hide-elem"><div class="hide-elem-title">$1</div><div class="hide-elem-content">');
    html = html.replace(/<p>@@<\/p>/g, '</div></div>');
    html = html.replace(/\\n/g, '<br>'); // 匹配 \n 为 <br>
    html = html.replace(/<p>[ ]+/, '<p>'); // 去除 <p> 标签开头的空白
    html = html.replace(/<p>(<img alt="cover".*>)<\/p>/g, '$1');
    var jq = $(html);

    this.nav = function() {
        var jq = $(html).filter('h1, h2');
        $('nav').html(jq);
    };

    this.section = function(title) {
        $('article').animate({opacity: 0}, 200);
        title = title.replace(/ /g, '');
        var jq = $(html);
        jq.each(function() {
            if($(this).text().replace(/ /g, '') == title) {
                var subSection = $(this).nextAll("h2, img, p").first().nextUntil("h2,h1");
                subSection = subSection.filter('*:not(h1,h2,.sub-header)');
                setTimeout(function() {
                    $('article').html(subSection);
                    resizeHook();
                    $('article').animate({opacity: 1}, 400);
                }, 200);
                return false; // break
            };
        });
    };

    this.subSection = function(title) {
        $('article').animate({opacity: 0}, 200);
        title = title.replace(/ /g, '');
        $(html).each(function() {
            if($(this).text().replace(/ /g, '') == title) {
                var subSection = $(this).nextUntil("h2,h1");
                subSection = subSection.filter('*:not(h1,h2,.sub-header)');
                setTimeout(function() {
                    $('article').html(subSection);
                    $('article').attr('id', '');
                    $('article').animate({opacity: 1}, 400);
                }, 200);
                return false; // break
            };
        });
    };

    this.highlight = function(text, timeout) {
        if(!timeout) timeout = 50;
        setTimeout(function() {
            $('body').removeHighlight();
            $('body').highlight(text);
        }, timeout);
    };

    this.search = function(text) {
        var jq = $(html).each(function() {
            if($(this).text().toUpperCase().indexOf(text.toUpperCase()) > 0) {
                $(this).addClass('mark');
                var nodeName = $(this)[0].nodeName.toLowerCase();
                if(nodeName == 'p' || nodeName == 'div') {
                    console.log($(this).prevAll('h1').first());
                    $(this).prevAll('h1').first().nextUntil($(this)).addBack().filter('h1, h2').addClass('mark');
                }
                if(nodeName == 'h2') {
                    $(this).prevAll('h1').first().addClass('mark');
                }
            }
        });
        $('article').html('<div id="index"></div>');
        $('#index').html(jq.filter('.mark'));
        that.highlight(text);
    };

    this.baiduMap = function() {
        $('article').html('<div id="allmap"></div>');
        if(typeof resizeHook != "undefined")
          resizeHook();
        var map = new BMap.Map("allmap");
        map.centerAndZoom(new BMap.Point(120.09391065692903, 30.310239963664857), 16);
        map.addControl(new BMap.NavigationControl());  //添加默认缩放平移控件
    };

    this.zdpoMap = function() {
        window.location.href = 'http://zdpo.zju.edu.cn/map/';
    };
};


var Cover = function() {
    var selector = 'article img[alt="cover"]',
        that = this;

    this.start = function() {
        that.stop(); // make sure only one interval exists
        that.init();
        $('body').css({'overflow-y': 'hidden'});
        window.coverInterval = setInterval(function() {
            that.next();
        }, 3000);
        window.coverTestInterval = setInterval(function() {
            that.test();
        }, 500);
    };

    // auto stop if img disappears
    this.test = function() {
        if($(selector).length == 0) {
            that.stop();
        }
    };

    this.stop = function() {
        $('body').css({'overflow-y': 'auto'});
        clearInterval(window.coverInterval);
        clearInterval(window.coverTestInterval);
    };

    this.init = function() {
        $('body, html').animate({scrollTop: 0});
        $(selector).fadeOut(200, function() {
            $(selector).first().fadeIn();
        });
    };

    this.next = function() {
        $(selector).each(function() {
            if($(this).is(':visible')) {
                $(this).fadeOut(200, function() {
                    var next = $(this).nextAll(selector);
                    if(next.length == 0) {
                        that.init();
                        return false;
                    }
                    next = next.first();
                    next.fadeIn();
                });
            }
        });
    };
};

$(document).ready(function() {
    cover = new Cover();
    $.get('markdown/freshman.md', function(data) {
        doc = new Doc(data);
        doc.section("地图");
        doc.nav();
        $('body').animate({opacity: 1}, 2000);
    });

    $('nav').on('click', 'h1 i', function(e) {
        doc.index();
        e.stopPropagation();   //停止事件冒泡
    });

    // $('nav').on('click', 'h1', function(e) {
    //     e.stopPropagation();   //停止事件冒泡
    //     return false;
    // });

    $('nav').on('click', 'h1', function() {
        $('nav h1.current').removeClass('current');
        $(this).addClass('current');
        $('nav h2').slideUp();
        $(this).nextUntil('h1').slideDown();
    });

    $('body').on('click', 'h1', function() {
        var title = $(this).text();
        title = title.replace(/<i>.*<\/i>/, '');
        doc.section(title);
        setTimeout(function() {
            $('body, html').animate({scrollTop: 0});
        }, 650);
        setTimeout(function() {
            cover.start();
        }, 500);
    });

    $('body').on('click', 'h3', function() {
        doc.section($(this).prevAll('h1').first().text());
        doc.subSection($(this).prevAll('h2').first().text());
        doc.highlight($(this).text(), 650);
        setTimeout(function() {
            var offset = $('h3 .highlight').offset();
            $('body, html').animate({scrollTop: offset.top - 50});
            $('.highlight').css({background: '#fff'});
        }, 670);
    });

    $('body').on('click', 'h2', function() {
        if($('#index').attr('id') == 'index') {
            console.log("index");
            var pos = $(this).prevAll('h1').first().text().replace(/ /g, '');
            var cur = $('nav h1').text().replace(/<i>.*<\/i>/, '').replace(/ /g, '');
            if(cur != pos) {
                doc.section(pos);
            }
        }
        var title = $(this).text();
        if(title.replace(/ /g, '') == '周边观察版') {
            doc.baiduMap();
            return;
        }
        if(title.replace(/ /g, '') == '三维全景版') {
            doc.zdpoMap();
            return;
        }
        doc.subSection(title, true);
        setTimeout(function() {
            $('body, html').animate({scrollTop: 0});
        }, 600);
    });

    $('#search').on('keyup', function() {
        var text = $(this).val();
        doc.search(text);
    });

    $('article').on('click', '.hide-elem-title', function() {
        $(this).parent().find('.hide-elem-content').each(function() {
            if($(this).is(":visible")) {
                $(this).slideUp();
            } else {
                $(this).slideDown();
            }
        });
    });
});


var resizeHook = function() {
    var w = $(window).width();
    var h = $(window).height();
    $('article').css({width: w - 300, height: h});
    $('#allmap').css({width: w - 150});

    var scale = (w - 150) / h,
        imgScale = 16 / 9;
    if(imgScale > scale) {
        $('img[alt="cover"]').css({width: 'auto', height: h});
    } else {
        $('img[alt="cover"]').css({width: w - 150, height: 'auto'});
    }

};
$(document).ready(function() {
    resizeHook();
});
if (window.addEventListener) {
    window.addEventListener('resize', function() { resizeHook(); });
} else if (window.attachEvent) {
    // for ie
    window.attachEvent('resize', function() { resizeHook(); });
}
