/* Google chrome extension
 * for vk.com social network
 * it allows to filter vk news - _NO_ reposts/groups
 * author: "alex sudakov <cygakoB@gmail.com>"
 *
 * TODO
 *   events handling
 *     on keypress (configured for unhandled case, add in config in future)
 *     on more posts upload
 *     on switch to news
 *   function post_type
 *     handle/parse more types (any repost is parsed now)
 *   function is_post_shown
 *     create config for extension 
 *     gets config for extension 
 *   add config for extension to analyze what to show
 *     reposts - yes/no/filter
 *       may be white/black list and default behavior
 *     groups - yes/no/filter
 *       may be white/black list and default behavior
*/

(function (document) {
    "use strict";

    // TODO DEBUG into config
    var DEBUG           = true
        ,debug          = function() {
            if(DEBUG) console.log.apply(console, arguments);
        }
        ,POST_STANDARD  = 'post_std'
        ,POST_REPOST    = 'post_repost'
        ,POST_GROUP     = 'post_group'
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

            return POST_STANDARD;
        }
        ,is_post_removed= function(idx, el, type) {
            if(null === type || undefined === type)
                type = post_type(idx, el);

            // based on type only:
            switch(type) {
                case POST_REPOST:
                    return true;
                case POST_GROUP:
                    return true;
            }

            return false;
        }
        ,filter         = function() {
            // div class="feed_row"
            jQuery('div.feed_row').each(function(idx, el) {
                var type    = post_type(idx, el);
                if(is_post_removed(idx, el, type)) {
                    debug("remove element: ", el);
                    el.remove();
                }
            });
        }
        ,TIMER_DELAY    = 1000
    ;

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
