function is_storage_ok() {
    if(!chrome.storage) {
        console.log("no storage permission was given, can't save options");
        alert("Нет разрешения на хранилище (передобавьте расширение с ним для возможности настройки)");
        return false;
    }
    return true;
}

function options_bool() {
    return {
        "show_reposts":     false
        ,"show_groups":     false
        ,"show_friends":    true
        ,"debug_mode":      false
    };
}

function save_options() {
    if(!is_storage_ok()) return;
 
    var opts    = {};
    for(var key in options_bool()) {
        opts[key]   = document.getElementById(key).checked;
    }
    chrome.storage.sync.set(
        opts
        ,function() {
            // update status to let user know options were saved.
            var status = document.getElementById('status');
            status.textContent = 'Настройки сохранены';
            setTimeout(function() {
                status.textContent = '';
            }, 750);
        }
    );
}

function restore_options() {
    if(!is_storage_ok()) return;

    chrome.storage.sync.get(
        options_bool()
        ,function(items) {
            var opts    = {};
            for(var key in options_bool()) {
                document.getElementById(key).checked    = items[key];
            }
        }
    );
}

document.addEventListener('DOMContentLoaded', restore_options);
for(var key in options_bool()) {
    document.getElementById(key).addEventListener('change', save_options);
}
