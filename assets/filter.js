(function (document) {
    "use strict";

    var config_default  = {
            "show_reposts":     false
            ,"show_groups":     false
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
        ,debug          = function() {
            // config can be initialized later than first call here
            // possible problem: unshown first debug calls
            if(config.debug_mode) console.log.apply(console, arguments);
        }
        ,POST_REPOST    = 'post_repost'
        ,POST_GROUP     = 'post_group'
        ,POST_FRIENDS   = 'post_friends'
        ,post_type      = function(idx, el) {
            var el_jq = jQuery(el);
            if(0 < el_jq.find('.published_by_wrap').length) {
                 return POST_REPOST;
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
            var post_el         = el_jq.find('div.post').first();
            var post_id         = post_el ? jQuery(post_el).attr('id') : null;
            if(null != post_id && post_id.match(/\-\d/)) {
                return POST_GROUP;
            }

            return POST_FRIENDS;
        }
        ,is_post_hidden = function(idx, el, type) {
            if(null === type || undefined === type)
                type = post_type(idx, el);

            // based on type only:
            switch(type) {
                case POST_REPOST:
                    return !config.show_reposts;
                case POST_GROUP:
                    return !config.show_groups;
                case POST_FRIENDS:
                    return !config.show_friends;
            }

            return false;
        }
        ,filter         = function() {
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
        ,TIMER_DELAY    = 1000
    ;

    config_init();

    // filter feed on document load
    debug("initial filter call");
    filter();

    // TODO add filter() call on events (instead or repeatition on timer):
    //   * on upload more news
    //   * on switch to news
    //   * on keypress (to force clearance in unhandled situation)
    var timer_filter_id = setInterval(function() {
            debug("another filter call");
            filter();
        }
        ,TIMER_DELAY
    );
}(document));
