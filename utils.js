var utils = {
    apiDomain: 'http://api.jsvolunteer.org',
    doNet: function(req) {
        var dfd = $.Deferred();
        $.ajax({
            url: req.url,
            async: true,
            type: req.type,
            data: req.data && req.data,
            dataType: 'json',
            success: function(resp) {
                if (resp.state === 1) {
                    dfd.resolve(resp);
                } else {
                    dfd.reject(resp);
                }
            },
            error: function(xhr, context) {
                dfd.reject(context);
            }
        });
        return dfd.promise();
    },
    doFormNet: function(req) {
        var dfd = $.Deferred();
        var oMyForm = new FormData();

        for (var i in req.data) {
            oMyForm.append(i, req.data[i]);
        }
        var xhr = new XMLHttpRequest();
        xhr.open(req.type, req.url);
        // if(req.type.toLowerCase() === 'post'){
        // xhr.setRequestHeader("Content-Type","multipart/form-data");
        // xhr.setRequestHeader('TOKEN', utils.config.token);
        // }
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    dfd.resolve(JSON.parse(xhr.responseText));
                } else {
                    dfd.reject(JSON.parse(xhr.responseText));
                }

            }
        };
        xhr.send(oMyForm);
        return dfd.promise();
    },
    /**
     * type 'yyyy-mm-dd'|'mm:ss'
     * unit {string} ms|s|min|h
     */
    formatTime: function formatTime(time, type, unit) {
        if (unit === 's') {
            var dateObj = new Date(time * 1000);
            var year = dateObj.getFullYear();
            var month = dateObj.getMonth() + 1 + '';
            month = this.formatTwo(month);
            var date = dateObj.getDate();
            date = this.formatTwo(date);
            var hour = dateObj.getHours();
            hour = this.formatTwo(hour);
            var min = dateObj.getMinutes();
            min = this.formatTwo(min);
            var sec = dateObj.getSeconds();
            sec = this.formatTwo(sec);
            if (type === 'mm:ss') {
                return min + ':' + sec;
            } else if (type === 'yyyy-mm-dd mm:ss') {
                return year + '-' + month + '-' + date + ' ' + min + ':' + sec;
            } else if (type === 'yyyy/mm/dd hh:mm') {
                return year + '/' + month + '/' + date + ' ' + hour + ':' + min;
            } else if (type === 'yyyy-mm-dd') {
                return year + '-' + month + '-' + date;
            }
        }
    },
    formatTwo: function formatTwo(str) {
        str = str + '';
        return str.length < 2 ? '0' + str : str;
    },
    showDialog: function showDialog($modal) {
        $modal.modal('show');
    },
    hideDialog: function hideDialog($modal) {
        $modal.modal('hide');
    }
};
window.utils = utils;

function popipDisappear() {
    setTimeout(function() {
        $(".popupbox").remove();
    }, 2000);
    $(".popupbox").removeClass('popshow');
}

window.alert = function popup(popUpTxt) {
    if (!$('.popupbox').get(0)) {
        var popUp = "<div class='popupbox'><div class='popupstyle'><div class='popupinner'>" + popUpTxt + "</div></div></div>";
        setTimeout(function() {
            $(".popupbox").addClass('popshow');
        }, 0);
        setTimeout(popipDisappear, 2000);
        $("body").append(popUp);
    }
}