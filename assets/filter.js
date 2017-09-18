(function (document) {
    "use strict";

    var config_default  = {
            "show_reposts":     false
            ,"show_groups":     false
            ,"show_ig":         true
            ,"show_friends":    true
            ,"show_adv":        false
            ,"show_adv_left":   false
            ,"hide_re":         []
            ,"likes_filter":    0
            ,"debug_mode":      false
        }
        ,config         = config_default
        ,config_on_change    = function(changes, area_name) {
            debug("config on change event:", changes, area_name);
            for(var key in changes) {
                config[key] = changes[key].newValue;
            }
            debug('config changed', config);
        }
        ,config_init    = function() {
            if(chrome.storage) {
                chrome.storage.sync.get(
                    config_default
                    ,function(items) {
                        for(var key in items) {
                            config[key] = items[key];
                        }
                        debug('config initialized', config);
                    }
                );
                chrome.storage.onChanged.addListener(config_on_change);
            }
        }
        ,getTime        = function() { return (new Date()).getTime() }
        ,time_filter    = null
        ,debug          = function() {
            // config can be initialized later than first call here
            // possible problem: unshown first debug calls
            if(config.debug_mode) console.log.apply(console, arguments);
        }
        ,error          = function() {
            // config can be initialized later than first call here
            // possible problem: unshown first debug calls
            if(config.debug_mode) console.log.apply(console, ["[ERROR]"].concat(arguments));
        }
        ,POST_REPOST    = 'post_repost'
        ,POST_GROUP     = 'post_group'
        ,POST_IG        = 'post_ig'
        ,POST_FRIENDS   = 'post_friends'
        ,POST_ADV       = 'post_adv'
        ,HIDE_RE        = 'hide_re'
        ,post_type      = function(idx, el) {
            var el_jq = jQuery(el);
            if(
                0 < el_jq.find('.published_by_wrap').length
                ||
                0 < el_jq.find('div[id^=feed_repost]').length
            ) {
                return POST_REPOST;
            }

            if(config.hide_re) {
                var hide_re  = [];
                if(jQuery.isArray(config.hide_re)) {
                    hide_re  = config.hide_re;
                }
                else if(
                    undefined !== config.hide_re
                    &&
                    null !== config.hide_re
                    &&
                    '' !== config.hide_re
                ) {
                    hide_re  = [config.hide_re];
                }
                else {
                    hide_re  = [];
                }
                for(var i=0; i<hide_re.length; i++) {
                    var suits   = false;
                    try {
                        var re  = new RegExp( hide_re[i], "i" );
                        suits   = el_jq.text().match(re);
                    }
                    catch(e) {
                        error("can't check "+i+"th hide_re:", e);
                    }

                    if(suits) return HIDE_RE;
                }
            }

            var author_el       = el_jq.find('a.author').first();
            var author_id       = author_el ? jQuery(author_el).attr('data-from-id') : null;
            if(null != author_id) {
                author_id   = parseInt(author_id);
                if(NaN != author_id) {
                    // looks like persons ids are positive
                    if(0 > author_id) return POST_GROUP;
                }
            }

            // one more way based on negative group's id
            var post_el         = (el_jq.find('div.post').first())[0];
            var post_id         = post_el ? jQuery(post_el).attr('id') : null;
            if(null != post_id && post_id.match(/\-\d/)) {
                return POST_GROUP;
            }

            // one more way based on negative group's id
            if(
                el_jq.find('a').toArray()
                // check if we have element, that hasClass for instagram
                .reduce(
                    function(prev, curr) {
                        return prev ? prev
                            : jQuery(curr).hasClass("wall_post_source_instagram") ? true : false
                    }
                    ,false
                )
            ) {
                return POST_IG;
            }

            /*
				1. example:
				<span class="explain"><span class="wall_text_name_explain_promoted_post" onmouseover="showTooltip(this, {text: &quot;<div class=\&quot;content\&quot;><span class=\&quot;header\&quot;>Рекламная запись<\/span><br>Эта запись добавлена в новостную ленту на основе Ваших интересов и информации из профиля.<\/div>&quot;, slide: 15, shift: [50, 0, 0], showdt: 400, hidedt: 200, className: 'wall_tt promoted_post_tt', hasover: true});">Рекламная запись</span></span>

				2. restricted:
				<div class="post_header">
					<a class="post_image" href="/nskroof">
						<img src="https://pp.vk.me/c630318/v630318525/46754/fkzbB57sPHA.jpg" data-post-id="-72326894_3846" width="50" height="50" class="post_img">
						<span class="blind_label">.</span>
					</a>
					<div class="post_header_info">
						<h5 class="post_author"><a class="author" href="/nskroof" data-from-id="-72326894" data-post-id="-72326894_3846">Свидание на крыше | Новосибирск</a> <span class="explain"><span class="wall_fixed_label">&nbsp;запись закреплена</span></span></h5>
						<div class="post_date"><a class="wall_text_name_explain_promoted_post post_link" href="/wall-72326894_3846" onclick="return showWiki({w: 'wall-72326894_3846'}, false, event);">Рекламная запись</a><span class="wall_text_name_explain_promoted_post_age_restriction">18+</span></div>
						<div class="ui_actions_menu_wrap _ui_menu_wrap " onmouseover="uiActionsMenu.show(this);" onmouseout="uiActionsMenu.hide(this);">
							<div class="ui_actions_menu_icons" tabindex="0" aria-label="Действия" role="button" onclick="uiActionsMenu.keyToggle(this, event);"><span class="blind_label">Действия</span></div>
							<div class="ui_actions_menu _ui_menu"><a class="ui_actions_menu_item" onclick="feed.ignoreItem('-72326894_3846', 'wall_-72326894_3846', '0704d6aa265bcd1891');" tabindex="0" role="link">Это не интересно</a></div>
						</div>
					</div>
				</div>
             */
            if(
                el_jq.find('[class*=promoted_post]').length
            ) {
                return POST_ADV;
            }

            /*
             */
            if(
                el_jq.find('span').toArray()
                // check if we have element, that hasClass for instagram
                .reduce(
                    function(prev, curr) {
                        return prev ? prev
                            : jQuery(curr).hasClass("wall_text_name_explain_promoted_post") ? true : false
                    }
                    ,false
                )
            ) {
                return POST_ADV;
            }

            return POST_FRIENDS;
        }
        ,is_post_hidden = function(idx, el, type) {
            if(null === type || undefined === type)
                type = post_type(idx, el);

            // based on type only:
            switch(type) {
                case HIDE_RE:
                    return true;
                case POST_REPOST:
                    return !config.show_reposts;
                case POST_GROUP:
                    return !config.show_groups;
                case POST_IG:
                    return !config.show_ig;
                case POST_FRIENDS:
                    return !config.show_friends;
                case POST_ADV:
                    return !config.show_adv;
            }

            return false;
        }
        ,filter         = function() {
            /* filter only on feed page, not notifications */
            var filter  = false;
            if(!window.location.href.match("/feed")) {
                filter  = false;
            }
            else {
                if(window.location.href.match("section=notifications")) {
                    filter  = false;
                }
                else {
                    filter  = true;
                }
            }

            if(filter) {
                /* go through all elements and show/hide (can be on options change) */
                jQuery('div.feed_row').each(function(idx, el) {
                    var el_jq   = jQuery(el);
                    var type    = post_type(idx, el_jq);
                    if(is_post_hidden(idx, el_jq, type)) {
                        if(el_jq.is(':visible')) {
                            debug("hide element: ", el_jq);
                            el_jq.hide();
                        }
                    }
                    else {
                        if(el_jq.is(':hidden')) {
                            debug("show element: ", el_jq);
                            el_jq.show();
                        }
                    }
                });
            }

            // hide left adv block no matter on the page
            if(!config.show_adv_left) {
                debug("hide left adv block");
                jQuery('#ads_left').hide();
            }

            // hide posts which has likes less then config.filter_likes no matter on news feed or group page
            if(config.likes_filter > 0) {
                jQuery('.post_like_count').each(function() {
                    var likes = parseInt(this.innerText.replace(/ /g, ''));
                    if (likes <= config.likes_filter) {
                        jQuery(this).parents('div._post').hide();                        
                    }
                });
            }


            time_filter = getTime();
            debug("time filter "+time_filter);
        }
        ,TIMER_DELAY                = 1000
        ,TIMER_DELAY_WAIT_FACTOR    = 0.333
    ;

    config_init();

    // filter feed on document load
    debug("initial filter call");
    filter();

    /* just re-check everything on repeat timer
     * another possible implementation:
     *   add filter() call on events:
     *   * upload more news
     *   * switch to news
     *   * keypress (to force clearance in unhandled situation)
     *   but it's too erroprone, working with timer now
     */
    var timer_filter_id = setInterval(function() {
            debug("another filter call");
            var past    = getTime() - time_filter;
            var delay   = TIMER_DELAY * TIMER_DELAY_WAIT_FACTOR;
            if(past > delay) {
                debug("past "+past+" since last filter, it's more than supposed delay "+delay+" => filter");
                filter();
            }
            else {
                debug("past "+past+" since last filter, it's less than supposed delay "+delay+" => skip filter");
            }
        }
        ,TIMER_DELAY
    );
}(document));
