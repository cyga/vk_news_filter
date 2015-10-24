function is_storage_ok() {
    if(!chrome.storage) {
        console.log("no storage permission was given, can't save options");
        alert("Нет разрешения на хранилище (передобавьте расширения с ним, для возможности настройки)");
        return false;
    }
    return true;
}

function save_options() {
    if(!is_storage_ok()) return;
 
    var show_reposts = document.getElementById('show_reposts').checked;
    var show_groups  = document.getElementById('show_groups').checked;
    var debug_mode   = document.getElementById('debug_mode').checked;
    chrome.storage.sync.set({
        "show_reposts":     show_reposts
        ,"show_groups":     show_groups
        ,"debug_mode":      debug_mode
    }, function() {
        // update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Настройки сохранены';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    if(!is_storage_ok()) return;

    chrome.storage.sync.get({
        // use default values
        "show_reposts":     false
        ,"show_groups":     false
        ,"debug_mode":      false
    }, function(items) {
        document.getElementById('show_reposts').checked     = items.show_reposts;
        document.getElementById('show_groups').checked      = items.show_groups;
        document.getElementById('debug_mode').checked       = items.debug_mode;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
