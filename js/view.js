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
        title = title.replace(/ /g, '');
        var jq = $(html);
        // 导航栏动画
        $('nav h1').each(function() {
            if($(this).text().replace(/ /g, '') == title) {
                $('nav h1.current').removeClass('current');
                $(this).addClass('current');
                $('h2.current').removeClass('current');
                window.animateLock = true;
                $('nav h2').stop(); // 终止动画
                $('nav h2').each(function() {
                    $(this).slideUp(400, function() {
                        window.animateLock = false;
                    });
                });
                var iter = function(jqObj) {
                    var $next = jqObj.next();
                    if($next[0] && $next[0].nodeName.toLowerCase() != 'h1' && $next.parent()[0].nodeName.toLowerCase() == 'nav') {
                        $next.slideDown({
                            duration: 400,
                            easing: "linear",
                            complete: function() {
                                if(!window.animateLock) {
                                    iter($next);
                                }
                            }
                        });
                    }
                }
                iter($(this));
            }
        });
        jq.each(function() {
            if($(this).text().replace(/ /g, '') == title) {
                var nextSection = $(this).nextAll('h1');
                nextSection = nextSection.first().text();
                if(nextSection) {
                    nextSection = $('<div id="next-chapter"><span>阅读下一章节</span><br></div>').append(nextSection);
                    nextSection = $('<section class="next"></section>').append(nextSection);
                }
                $('article').html('');
                var subSections = $(this).nextUntil("h1");
                subSections = subSections.each(function() {
                    var nodeName = $(this)[0].nodeName.toLowerCase();
                    if(nodeName == 'h2') {
                        var subSection = $(this).nextUntil("h1,h2");
                        var jq = $('<section><h2>'+$(this).text()+'</h2></section>').append(subSection);
                        $('article').append(jq);
                    }
                });
                if(nextSection) {
                    $('article').append(nextSection);
                }
                return false; // break
            };
        });
        var subSection = $('article section').first().find('h2').first().text();
        that.subSection(subSection);
    };

    this.subSection = function(title) {
        title = title.replace(/ /g, '');
        $('nav h2').each(function() {
            if(title == $(this).text().replace(/ /g, '')) {
                $('nav h2.current').removeClass('current');
                $(this).addClass('current');
            }
        });
        var offsetLeft = 0;
        $('article section').each(function() {
            if(title == $(this).find('h2').first().text().replace(/ /g, '')) {
                $('article section.current').removeClass('current');
                $(this).addClass('current');
                $('article').animate({'margin-left': -offsetLeft}, 400, function() {
                    $('article section').perfectScrollbar();
                });
                return false;
            }
            offsetLeft += $(this).outerWidth(true); // Sum of width, padding, borders, margins
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
//                    console.log($(this).prevAll('h1').first());
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
        //        $('body').css({'overflow-y': 'hidden'});
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
        //        $('body').css({'overflow-y': 'auto'});
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
        doc.nav();
        doc.section("地图");
        $('body').animate({opacity: 1}, 2000);
    });

    $('nav').on('click', 'h1 i', function(e) {
        doc.index();
        e.stopPropagation();   //停止事件冒泡
    });

    $('body').on('click', 'h1', function() {
        var title = $(this).text();
        title = title.replace(/<i>.*<\/i>/, '');
        doc.section(title);
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
//            console.log("index");
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

    // 绑定方向键
    $('body').keyup(function(e) {
        var code = e.keyCode;
        if(code == 39) {
            $('#next').click();
        }
        if(code == 37) {
            $('#prev').click();
        }
    });

    // no scroll
    $(window).scroll(function() {
        window.scrollTo(0, 0);
    });

    $('#next').click(function() {
        var next = $('section.current').first().next().find('h2').first().text();
        if(next) {
            doc.subSection(next);
        } else {
            next = $('nav h1.current').first().nextAll('h1').first().text();
            if(next) {
                doc.section(next);
            }
        }
    });

    $('#prev').click(function() {
        var prev = $('section.current').first().prev().find('h2').first().text();
        if(prev) {
            doc.subSection(prev);
        } else {
            prev = $('nav h1.current').first().prevAll('h1').first().text();
            if(prev) {
                doc.section(prev);
            }
        }
    });


});

var resizeHook = function() {
    var w = $(window).width();
    var h = $(window).height();
    $('article').css({height: h});
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
