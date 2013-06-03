var Doc = function(md) {

    var that = this,
        html = markdown.toHTML(md);
    html = html.replace(/<h2>(.*)——(.*) (.*)<\/h2>/g, "<h2>$1</h2><div class=\"sub-header\">$2<br>$3</div>");
    html = html.replace(/<p>@@[ ]*([^<]+)<\/p>/g, '<div class="hide-elem"><div class="hide-elem-title">$1</div><div class="hide-elem-content">');
    html = html.replace(/<p>@@<\/p>/g, '</div></div>');
    html = html.replace(/\\n/g, '<br>');
    var jq = $(html);

    this.demo = function() {
        console.log(that.html);
        $('article').html(html);
    };

    this.index = function() {
        $('article').animate({opacity: 0}, 400);
        var jq = $(html).filter('h1,h2,h3');
        setTimeout(function() {
            $('article').html('<div id="index"></div>');
            $('#index').html(jq);
            $('article').animate({opacity: 1}, 400);
            $('#search').fadeIn(400);
        }, 400);
    };

    this.section = function(title) {
        $('article, nav').animate({opacity: 0}, 200);
        title = title.replace(/ /g, '');
        var jq = $(html);
        jq.each(function() {
            if($(this).text().replace(/ /g, '') == title) {
                var subSection = $(this).nextAll("h2").first().nextUntil("h2");
                subSection = subSection.filter('*:not(h1,h2,.sub-header)');
                var nav = $(this).nextUntil("h1").filter('h2, .sub-header');
                setTimeout(function() {
                    console.log(nav);
                    $('nav').html(nav);
                    $('nav').prepend('<h1>'+title+'<i class="icon-reorder"></i></h1>');
                    $('article').html(subSection);
                    $('article, nav').animate({opacity: 1}, 400);
                }, 200);
                return false; // break
            };
        });
        $('#search').fadeOut();
    };

    this.sectionWithCover = function(title) {

    };

    this.subSection = function(title) {
        $('article').animate({opacity: 0}, 200);
        title = title.replace(/ /g, '');
        $(html).each(function() {
            if($(this).text().replace(/ /g, '') == title) {
                var subSection = $(this).nextUntil("h2");
                subSection = subSection.filter('*:not(h1,h2,.sub-header)');
                setTimeout(function() {
                    $('article').html(subSection);
                    $('article').attr('id', '');
                    $('article').animate({opacity: 1}, 400);
                }, 200);
                return false; // break
            };
        });
        $('#search').fadeOut();
    };

    this.highlight = function(text, timeout) {
        if(!timeout) timeout = 50;
        setTimeout(function() {
            $('body').removeHighlight();
            var arr = text.split(' ');
            for(var i=0; i<arr.length; i++) {
                $('body').highlight(arr[i]);
            }
        }, timeout);
    };

    this.search = function(text) {
        var jq = $(html).each(function() {
            if($(this).text().toUpperCase().indexOf(text.toUpperCase()) > 0) {
                $(this).addClass('mark');
                var nodeName = $(this)[0].nodeName.toLowerCase();
                console.log(nodeName);
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

};

$(document).ready(function() {
    $.get('freshman.md', function(data) {
        doc = new Doc(data);
        doc.section("地图");
        $('body').animate({opacity: 1}, 2000);
    });

    $('nav').on('click', 'h1 i', function(e) {
        doc.index();
        e.stopPropagation();   //停止事件冒泡
    });

    $('nav').on('click', 'h1', function(e) {
        e.stopPropagation();   //停止事件冒泡
        return false;
    });

    $('body').on('click', 'h1', function() {
        var title = $(this).text();
        title = title.replace(/<i>.*<\/i>/, '');
        doc.section(title);
    });

    $('body').on('click', 'h3', function() {
        doc.section($(this).prevAll('h1').first().text());
        doc.subSection($(this).prevAll('h2').first().text());
        doc.highlight($(this).text(), 650);
        setTimeout(function() {
            var offset = $('h3 .highlight').offset();
            $('body, html').animate({scrollTop: offset.top - 50});
        }, 670);
    });

    $('body').on('click', 'h2', function() {
        if($('article').attr('id') == 'index') {
            doc.section($(this).prevAll('h1').last().text());
        }
        var title = $(this).text();
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
