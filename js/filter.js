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

    var DEBUG           = true
        ,debug          = function(msg) {
            // TODO how to accept/use different number of arguments in JS?
            if(DEBUG) console.log(msg);
        }
        ,POST_STANDARD  = 'post_std'
        ,POST_REPOST    = 'post_repost'
        ,post_type      = function(idx, el) {
            if(0 < jQuery(el).find('.published_by_wrap').length) {
                 return POST_REPOST;
            }

            return POST_STANDARD;
        }
        ,is_post_removed= function(idx, el, type) {
            if(null === type) type = post_type(idx, el);

            // TODO 
            // simple filter for reposts
            if(POST_REPOST == type) return true;

            return false;
        }
        ,filter         = function() {
            // div class="feed_row"
            jQuery('div.feed_row').each(function(idx, el) {
                var type    = post_type(idx, el);
                if(is_post_removed(idx, el, type)) {
                    debug("remove element: ");
                    debug(el);
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
