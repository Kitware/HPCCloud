/*! vtkWeb/ParaViewWeb - v2.0 - 2015-09-04
* http://www.kitware.com/
* Copyright (c) 2015 Kitware; Licensed BSD */
(function ($, GLOBAL) {
    var EXPLORATION_TEMPLATE = "<div class='input exploration-config'><div class='title'>Exploration settings</div><ul><li><div class='label'>Exploration type</div><select><option>Composite</option><option>Image base</option></select></li><li class='for-composite'><div class='label'>Number of geometries<span class='value'></span></div><input class='slider nb-geo' type='range' value='11' min='1' max='62'/></li><li class='for-composite'><div class='label'>Number of captures <span class='value'></span></div><input class='slider nb-all' type='range' value='21' min='1' max='128'/></li><li><div class='label'>Parameter range</div><input name='params' type='text' value='1,1'/></li></ul></div>",
    CAMERA_TEMPLATE = "<div class='input right camera-handler'><div class='title'>Camera settings</div><ul><li><div class='label'>Camera manager</div><select><option value='360'>360+</option><option value='w'>Wobble</option><option value='f'>Fix</option></select></li><li class='360 w'><div class='label'>Sampling Phi angle <span class='value'></span></div><input class='slider' type='range' min='5' max='180' value='18' name='phi'/></li><li class='360'><div class='label'>Sampling Theta angle <span class='value'></span></div><input class='slider' type='range' min='5' value='30' max='85' name='theta'/></li><li><div class='label'>Total number of viewpoint</div><span class='nb-view-points'></span></li></ul></div>",
    IMAGE_TEMPLATE = "<div class='input image-config'><div class='title'>Image settings</div><ul><li><div class='label'>Image type</div><select><option>JPG</option><option>PNG</option><option>TIFF</option></select></li><li><div class='label'>Image resolution</div><input type='text' value='500' name='width' class='half'/> x <input type='text' value='500' name='height' class='half'/></li></ul></div>",
    RESULT_TEMPLATE = "<div class='output estimate-result'><div class='title'>Cost estimate</div><table><tr><td>Average render time for the scene</td><td> : <input type='text' name='avg-render-time' value='200'/> ms</td></tr><tr><td>Total number of images</td><td> : <span class='total-nb-images'></span></td></tr><tr><td>Estimate image size</td><td> : <span class='image-size'></span></td></tr><tr><td>Total data size</td><td> : <span class='total-disk-usage'></span></td></tr><tr><td>Estimated time cost</td><td> : <span class='time-cost'></span></td></tr></table></div>",
    PAGE_CONTENT = [CAMERA_TEMPLATE, EXPLORATION_TEMPLATE, IMAGE_TEMPLATE, RESULT_TEMPLATE],
    MagicNumbers = {
        "PNG": {
            'space': function(nbPixels) { return nbPixels * 0.6; },
            'time' : function(nbPixels) { return nbPixels * 0.000000204032; }
        },
        "JPG": {
            'space': function(nbPixels) { return nbPixels * 0.24; }, // Max noticed and PNG is usally 2.5 bigger
            'time' : function(nbPixels) { return nbPixels * 0.000000131541818181818; }
        },
        "TIFF": {
            'space': function(nbPixels) { return nbPixels * 3.028; },
            'time' : function(nbPixels) {
                var imageSize = nbPixels * 3.028,
                bufferDisk = 16000000;
                return (imageSize < bufferDisk) ? 0.0000000241866666666667 * nbPixels : 0.000000102088 * nbPixels;
            }
        },
        "COMPOSITE": {
            'space': function(nbPixels) { return nbPixels * 0.448; },
            'time' : function(nbPixels) { return nbPixels * 0.000000642785454545454;}
        },
        "RGB_CAPTURE": {
            'space': function(nbPixels) { return 0; },
            'time' : function(nbPixels) { return nbPixels * 0.00000898981818181818;}
        }
    };

    // ========================================================================

    function getNbPixels(container) {
        var width = Number($('input[name="width"]', container).val()),
        height = Number($('input[name="height"]', container).val()),
        nbObjects = ($('.exploration-config select', container).val() == "Composite") ?  (1+Number($('.exploration-config .slider.nb-all', container).val())) : 1;

        return (width*height*nbObjects);
    }

    // ========================================================================

    function getNbZPixels(container) {
        var width = Number($('input[name="width"]', container).val()),
        height = Number($('input[name="height"]', container).val()),
        format = $('.image-config select', container).val(),
        nbObjects = ($('.exploration-config select', container).val() == "Composite") ?  (1+Number($('.exploration-config .slider.nb-geo', container).val())) : 1;

        return (width*height*nbObjects);
    }

    // ========================================================================

    function getImageSize(container) {
        var format = $('.image-config select', container).val();
        return MagicNumbers[format]['space'](getNbPixels(container));
    }

    // ========================================================================

    function getImageTime(container) {
        var format = $('.image-config select', container).val();
        return MagicNumbers[format]['time'](getNbPixels(container));
    }

    // ========================================================================

    function getCompositeSize(container) {
        return MagicNumbers["COMPOSITE"]['space'](getNbZPixels(container));
    }

    // ========================================================================

    function getCompositeTime(container) {
        return MagicNumbers["COMPOSITE"]['time'](getNbZPixels(container));
    }

    // ========================================================================

    function formula(cost) {
        var dollarsAmount = 0;
        if(cost) {
            if(cost["time"]) {
                dollarsAmount += 0.001 * cost["time"];
            }
            if(cost["space"]) {
                dollarsAmount += 0.000000002 * cost["space"];
            }
            if(cost["images"]) {
                dollarsAmount += 0.001 * cost["images"];
            }
        }
        return dollarsAmount;
    }

    // ========================================================================

    function formatTime(t) {
        var seconds = Number(t),
        minutes = Math.floor(seconds / 60),
        hours = Math.floor(minutes / 60),
        buffer = [];

        seconds %= 60;
        seconds = Math.floor(seconds);
        minutes %= 60;
        minutes = Math.floor(minutes);

        if(hours > 0) {
           buffer.push(hours);
        }
        if(minutes > 0 || hours > 0) {
           buffer.push(("00" + minutes).slice (-2));
        }
        if(seconds > 0 || minutes > 0 || hours > 0) {
            buffer.push(("00" + seconds).slice (-2));
        }

        return buffer.join(':');
    }

    // ========================================================================

    function formatSpace(t) {
        var space = Number(t), unit = [ ' B', ' K', ' M', ' G', ' T'], currentUnit = 0;
        while(space > 1000) {
            space /= 1000;
            currentUnit++;
        }
        return space.toFixed(2) + unit[currentUnit];
    }

    // ========================================================================

    function formatDollars(v) {
        x = v.toFixed(2).toString();
        var pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(x)) {
            x = x.replace(pattern, "$1,$2");
        }
        return x;
    }

    // ------------------------------------------------------------------------

    function updateNumberOfImages(container) {
        var nbImagesContainer = $('.total-nb-images', container),
        parameters = $('.exploration-config input[name="params"]', container).val().split(','),
        nbViews = Number($('.nb-view-points', container).attr('data-value')),
        nbParams = 1;

        for(var idx in parameters) {
           nbParams *=  Number(parameters[idx]);
        }

        nbImagesContainer.html(nbParams*nbViews).attr('data-value', nbParams*nbViews);
        updateTotalEstimate(container);
    }

    // ------------------------------------------------------------------------

    function updateImageSize(container) {
        $('.output .image-size', container).html(formatSpace(getImageSize(container)));
        updateTotalEstimate(container);
    }

    // ------------------------------------------------------------------------

    function updateCameraEstimate(container) {
        var phiContainer = $('.w.360 span.value', container),
        phi = Number($('input[name="phi"]', container).val()),
        theta = Number($('input[name="theta"]', container).val()),
        resultContainer = $('.nb-view-points', container),
        cameraType = $('.camera-handler select', container).val();

        $('.360,.w', container).hide();

        if (cameraType == 'f') {
            resultContainer.html("1").attr('data-value', 1);
        } else if (cameraType == '360') {
            $('.360', container).show();
            var a = Math.floor(360/phi), b = (1 + 2*Math.floor(89/theta));
            resultContainer.html(a + " x " + b + " = " + (a*b)).attr('data-value', (a*b));
            if(360%phi === 0) {
                phiContainer.css('color', 'black');
            } else {
                phiContainer.css('color', 'red');
            }
        } else if (cameraType == 'w') {
            $('.w', container).show();
            resultContainer.html("9").attr('data-value', 9);
        }

        updateNumberOfImages(container);
    }

    // ------------------------------------------------------------------------

    function updateTotalEstimate(container) {
        var totalSizeContainer = $('.total-disk-usage', container),
        totalTimeContainer = $('.time-cost', container),
        nbImages = Number( $('.total-nb-images', container).attr('data-value')),
        dataSizePerImage = getImageSize(container),
        timePerImage = getImageTime(container),
        nbRender = nbImages,
        renderTime = Number($('.output input', container).val()) / 1000,
        rgbCaptureTime = MagicNumbers["RGB_CAPTURE"]['time'](getNbPixels(container));

        if ($('.exploration-config select', container).val() == "Composite") {
            dataSizePerImage += getCompositeSize(container);
            timePerImage += getCompositeTime(container);
            nbRender *= 1 + Number($('.exploration-config .slider.nb-all', container).val());
        }

        // console.log('nb pix: ' + getNbPixels(container));
        // console.log('image size: ' + getImageSize(container));
        // console.log('composite size: ' + getCompositeSize(container));
        // console.log('composite time: ' + getCompositeTime(container));

        totalSizeContainer.html(formatSpace(dataSizePerImage*nbImages));
        totalTimeContainer.html(formatTime(timePerImage*nbImages + (renderTime*nbRender) + rgbCaptureTime));
    }

    // ------------------------------------------------------------------------

    function initializeListeners(container) {
        $('.slider', container).bind('keyup change',function(){
            var me = $(this);
            $('.value', me.parent()).html(me.val());
            updateCameraEstimate(container);
        }).trigger('change');

        $('.camera-handler select', container).change(function(){
            updateCameraEstimate(container);
        }).trigger('change');

        $('.exploration-config input[name="params"]', container).change(function(){
            updateNumberOfImages(container);
        });

        $('.exploration-config select', container).change(function(){
            var me = $(this),
            isComposite = (me.val() == "Composite");

            if(isComposite) {
                $('.for-composite', container).show();
            } else {
                $('.for-composite', container).hide();
            }

            updateImageSize(container);
        });

        $('.image-config select, .exploration-config .slider, .image-config input').bind('keyup change', function(){
            updateImageSize(container);
        }).trigger('change');

        $('.output input').change(function(){
            updateTotalEstimate(container);
        });
    }

    // ------------------------------------------------------------------------

    /**
     * jQuery catalyst view constructor.
     *
     * @member jQuery.vtkCatalystViewer
     * @param project
     * @param basePath
     * Root directory for data to visualize
     */

    $.fn.vtkCatalystAnalysisCostEstimate = function() {
        return this.each(function() {
            var me = $(this).unbind().empty().addClass('cost-estimate').html(PAGE_CONTENT.join(''));

            initializeListeners(me);
        });
    }

}(jQuery, window));(function ($, GLOBAL) {
    var TYPE_CONVERTER = {
        "catalyst-viewer": "vtk-icon-loop-alt",
        "catalyst-resample-viewer" : "vtk-icon-chart-line",
        "composite-image-stack" : "vtk-icon-list-add",
        "catalyst-pvweb" : "vtk-icon-laptop"
    };

    // ========================================================================

    function formula(cost) {
        var dollarsAmount = 0;
        if(cost) {
            if(cost["time"]) {
                dollarsAmount += 0.001 * cost["time"];
            }
            if(cost["space"]) {
                dollarsAmount += 0.000000002 * cost["space"];
            }
            if(cost["images"]) {
                dollarsAmount += 0.001 * cost["images"];
            }
        }
        return dollarsAmount;
    }

    // ========================================================================

    function formatTime(t) {
        var seconds = Number(t),
        minutes = Math.floor(seconds / 60),
        hours = Math.floor(minutes / 60),
        buffer = [];

        seconds %= 60;
        seconds = Math.floor(seconds);
        minutes %= 60;
        minutes = Math.floor(minutes);

        if(hours > 0) {
           buffer.push(hours);
        }
        if(minutes > 0 || hours > 0) {
           buffer.push(("00" + minutes).slice (-2));
        }
        if(seconds > 0 || minutes > 0 || hours > 0) {
            buffer.push(("00" + seconds).slice (-2));
        }

        return buffer.join(':');
    }

    // ========================================================================

    function formatSpace(t) {
        var space = Number(t), unit = [ ' B', ' K', ' M', ' G', ' T'], currentUnit = 0;
        while(space > 1000) {
            space /= 1000;
            currentUnit++;
        }
        return space.toFixed(2) + unit[currentUnit];
    }

    // ========================================================================

    function formatDollars(v) {
        x = v.toFixed(2).toString();
        var pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(x)) {
            x = x.replace(pattern, "$1,$2");
        }
        return x;
    }

    // ------------------------------------------------------------------------

    function buildBillingPage(info, path, formula) {
        var content = [ "<table class='catalyst-bill'><tr class='head'></td><td class='empty title'></td><td><span class='vtk-icon-resize-horizontal-1'/></td><td><span class='vtk-icon-clock'/></td><td><span class='vtk-icon-database'/></td><td><span class='vtk-icon-picture-1'/></td><td><span class='vtk-icon-dollar'/></td></tr>" ],
        total = { "space": 0, "images": 0, "time": 0 , "dollars": 0},
        analysisCount = info['analysis'].length;

        // Add each analysis
        while(analysisCount--) {
            var item = info['analysis'][analysisCount],
            cost = item['cost'],
            dollars = formula(cost);

            total['space'] += cost['space'];
            total['images'] += cost['images'];
            total['time'] += cost['time'];
            total['dollars'] += dollars;

            content.push(buildBillEntry(item, cost, dollars));
        }

        // Add total
        content.push("<tr class='sum'><td>Total</td><td></td><td>"+ formatTime(total["time"]) +"</td><td>"+ formatSpace(total["space"]) +"</td><td>"+ total["images"] +"</td><td>"+ formatDollars(total["dollars"]) +"</td></tr></table>")

        return "<div class='view cost'>" + content.join('') + "</div>";
    }

    // ------------------------------------------------------------------------

    function buildBillEntry(item, cost, dollars) {
        var classType = TYPE_CONVERTER[item["type"]],
        title = item["title"],
        time = cost["time"],
        space = cost["space"],
        images = cost["images"],
        width = cost.hasOwnProperty('image-width') ? cost["image-width"] : "";

        return "<tr><td class='title'><span class='" + classType + "'/>" + title + "</td><td class='image-width value'>"+width+"</td><td class='time value'>" + formatTime(time) + "</td><td class='space value'>" + formatSpace(space) + "</td><td class='images value'>" + images + "</td><td class='dollars value'>" + formatDollars(dollars) + "</td></tr>";
    }

    /**
     * jQuery catalyst view constructor.
     *
     * @member jQuery.vtkCatalystViewer
     * @param project
     * @param basePath
     * Root directory for data to visualize
     */

    $.fn.vtkCatalystAnalysisCost = function(project, dataBasePath) {
        return this.each(function() {
            var me = $(this).unbind().empty().html(buildBillingPage(project, dataBasePath, formula));
        });
    }

}(jQuery, window));(function ($, GLOBAL) {
    var TOOLBAR_TEMPLATE = '<div class=sub-menu><ul class="menu left"><li class="vtk-icon-list-add sub action" data-type="composite-image-stack"><ul></ul></li><li class="vtk-icon-chart-line sub action" data-type="catalyst-resample-viewer"><ul></ul></li><li class="vtk-icon-loop-alt sub action" data-type="catalyst-viewer"><ul></ul></li><li class="vtk-icon-laptop sub action" data-type="catalyst-pvweb"><ul></ul></li></ul><ul class="menu right"><li class="layout-size" data-layout-size="2"><span class="layout-value">50 %</span><span class="vtk-icon-zoom-in zoom-action" data-delta=-1/><span class="vtk-icon-zoom-out zoom-action" data-delta=1/></li><li class="vtk-icon-magic action"/><li class="vtk-icon-trash"/></ul></div><div class="bench-viewers"></div>',
    ENTRY_TEMPLATE = '<li class="create-viewer" data-path="PATH" data-title="TITLE">TITLE<i class=help>DESCRIPTION</i></li>',
    VIEWER_FACTORY = {
        "catalyst-viewer": {
            class: "vtk-icon-loop-alt",
            factory: function(domToFill, path) {
                domToFill.vtkCatalystViewer(path, false);
            }
        },
        "catalyst-resample-viewer" : {
            class: "vtk-icon-chart-line",
            factory: function(domToFill, path) {
                domToFill.vtkCatalystResamplerViewer(path);
            }
        },
        "composite-image-stack" : {
            class: "vtk-icon-list-add",
            factory: function(domToFill, path) {
                domToFill.vtkCatalystCompositeViewer(path);
            }
        },
        "catalyst-pvweb" : {
            class: "vtk-icon-laptop",
            factory: function(domToFill, path) {
                domToFill.vtkCatalystPVWeb(path);
            }
        }
    };

    // ------------------------------------------------------------------------

    function initializeListeners(container) {
        $('.create-viewer', container).addClass('action').click(function(){
            var me = $(this),
            path = me.attr('data-path'),
            type = me.parent().parent().attr('data-type'),
            title = me.attr('data-title'),
            workspace = $('.bench-viewers', container),
            layoutSize = Number($('.layout-size', container).attr('data-layout-size')),
            size = $(window).width() / layoutSize - 15,
            viewer = $('<div/>', { class: 'viewer', 'data-type': type, html: "<div class='title-bar'><span class='title'>"+title+"</span><span class='right action close vtk-icon-cancel'/></div><div class='content'></div>"});

            $('li.sub', container).removeClass('active');

            // Attach close action to viewer
            $('.close', viewer).bind('click', function(){
                viewer.remove();
            });

            // Add viewer
            viewer.css('width', (size-2) + 'px').css('height', (20 + size - 2) + 'px').appendTo(workspace);

            // Provide content
            VIEWER_FACTORY[type].factory($('.content', viewer), path);
        });

        $('.vtk-icon-trash', container).addClass('action').click(function(){
            $('.close', container).trigger('click');
        });

        $('.zoom-action', container).addClass('action').click(function(){
            var me = $(this),
            size = Number(me.parent().attr('data-layout-size')),
            delta = Number(me.attr('data-delta'));
            size += delta;
            if(size < 1) {
                size = 1;
            } else if(size > 5) {
                size = 5;
            }
            me.parent().attr('data-layout-size', size);
            $('.layout-value', me.parent).html( Math.floor(100/size) + ' %');
        });
        $('.vtk-icon-magic').hide();
        $('.sub-menu li.sub', container).click(function(){
            var me = $(this), alreadyActive = me.hasClass('active');
            $('li.sub', me.parent()).removeClass('active');
            if(!alreadyActive) {
                me.addClass('active');
            }
        });
    }

    /**
     * jQuery catalyst view constructor.
     *
     * @member jQuery.vtkCatalystViewer
     * @param project
     * @param basePath
     * Root directory for data to visualize
     */

    $.fn.vtkCatalystAnalysisBench = function(project, dataBasePath) {
        return this.each(function() {
            var me = $(this).unbind().empty().html(TOOLBAR_TEMPLATE),
            menu = $('.menu.left', me),
            buffer = [],
            analysis = project.analysis,
            count = analysis.length,
            containers = {
                "composite-image-stack" : $('.menu.left > li[data-type="composite-image-stack"] > ul', me),
                "catalyst-resample-viewer" : $('.menu.left > li[data-type="catalyst-resample-viewer"] > ul', me),
                "catalyst-viewer" : $('.menu.left > li[data-type="catalyst-viewer"] > ul', me),
                "catalyst-pvweb" : $('.menu.left > li[data-type="catalyst-pvweb"] > ul', me)
            },
            buffers = { "composite-image-stack" : [], "catalyst-resample-viewer" : [], "catalyst-viewer" : [], "catalyst-pvweb" : [] };

            // Fill buffers
            while(count--) {
                var item = analysis[count];
                buffers[item.type].push(ENTRY_TEMPLATE.replace(/PATH/g, dataBasePath + '/' + item.id).replace(/TITLE/g, item.title).replace(/DESCRIPTION/g, item.description));
            }

            // Update UI
            for(var key in containers) {
                containers[key].html(buffers[key].join(''));
            }

            // Handle listeners
            initializeListeners(me);
        });
    }

}(jQuery, window));(function ($, GLOBAL) {
    var SLIDER_TEMPLATE = '<div class="label"><span class="flag vtk-icon-flag"/>LABEL<span class="NAME-value">DEFAULT</span></div><input type="range" min="0" max="SIZE" value="INDEX" name="NAME" data-values="VALUES"/>',
    SELECT_TEMPLATE = ' <div class="label select"><span class="flag vtk-icon-flag"/>LABEL<select name="NAME">VALUES</select></div>',
    OPTION_TEMPLATE = '<option>VALUE</option>',
    EXCLUDE_ARGS = { "theta": true };

    // ========================================================================
    // Helper method
    // ========================================================================

    function getRelativeLocation(element, mouseEvent) {
        var parentOffset = element.offset(),
        x = mouseEvent.pageX || mouseEvent.originalEvent.pageX || mouseEvent.originalEvent.mozMovementX,
        y = mouseEvent.pageY || mouseEvent.originalEvent.pageY || mouseEvent.originalEvent.mozMovementY,
        relX = x - parentOffset.left,
        relY = y - parentOffset.top;
        return [ relX, relY ];
    }

    // ========================================================================
    // Download manager
    // ========================================================================

    function createDownloadManager(container, poolSize, basepath) {
        var idleImages = [], processingQueue = [], manager = {
            clearProcessingQueue: function() {
                processingQueue = [];
            },

            download: function(url) {
                processingQueue.push(url);
                download();
            },

            downloadFiles: function(filePattern, argName, argValues, args) {
                var baseFileName = filePattern, rStr = '{'+argName+'}';

                for(key in args) {
                    if(key !== argName) {
                        baseFileName = baseFileName.replace('{'+key+'}', args[key]);
                    }
                }

                for(idx in argValues) {
                    processingQueue.push(basepath + '/' + baseFileName.replace(rStr, argValues[idx]));
                }
            }
        };

        // Attach download manager to container
        container.data('download-manager', manager);
        container.bind('load-image', function(e) {
            manager.download(basepath + '/' + e.filename);
        });

        function download() {
            while(idleImages.length > 0 && processingQueue.length > 0) {
                var img = idleImages.pop(),
                url = processingQueue.pop();
                img.src = url;
            }
        }

        function onLoadCallback(arg) {
            var me = $(this), url = me.attr('src');
            idleImages.push(this);
            container.trigger({
                type: "image-loaded",
                url: url
            });
            download();
        }

        function onError() {
            idleImages.push(this);
            download();
        }

        for(var i = 0; i < poolSize; ++i) {
            var img = new Image();
            img.onload = onLoadCallback;
            img.onabort = onError;
            img.onerror = onError;
            idleImages.push(img);
        }

        return manager;
    }

    // ========================================================================
    // Events
    // ========================================================================

    function fireLoadImage(container) {
        // Extrat container info
        var filename = container.data('info')['name_pattern'],
        args = container.data('active-args');

        // Update filename
        for(key in args) {
            filename = filename.replace('{'+key+'}', args[key]);
        }

        // Trigger event
        container.trigger({
            type: 'load-image',
            arguments: args,
            filename: filename
        });
    }

    // ========================================================================
    // Listeners
    // ========================================================================

    function initializeListeners(container) {
        var play = $('.play', container),
        stop = $('.stop', container),
        currentArgs = container.data('active-args'),
        activeArgName = null,
        activeValues = [],
        activeValueIndex = 0,
        keepAnimation = false;

        function animate() {
            if(activeArgName !== null) {
                activeValueIndex++;
                activeValueIndex = activeValueIndex % activeValues.length;
                updateActiveArgument(container, activeArgName, activeValues[activeValueIndex]);

                if(keepAnimation) {
                    setTimeout(animate, 150);
                }
            }
        }

        // Update Control UI when camera position change
        container.bind('invalidate-viewport', function(){
            // Update phi
            var currentPhi = Number(currentArgs.phi),
            phiSlider = $('input[name="phi"]', container),
            values = phiSlider.attr('data-values').split(':'),
            newIdx = 0,
            count = values.length;

            // Find matching index
            while(count--) {
                if(Number(values[count]) === currentPhi) {
                    newIdx = count;
                    count = 0;
                }
            }

            // Update slider value
            phiSlider.val(newIdx).trigger('change');
            $('span.phi-value', container).html(currentArgs.phi);
        });

        // Attach slider listener
        $('input[type="range"]', container).bind('change keyup mousemove',function(){
            var slider = $(this),
            name = slider.attr('name'),
            values = slider.attr('data-values').split(":"),
            idx = slider.val();

            updateActiveArgument(container, name, values[idx]);
        });

        // Attach select listener
        $('select', container).change(function(){
            var select = $(this),
            name = select.attr('name'),
            value = select.val();

            updateActiveArgument(container, name, value);
        });

        $('.toggle', container).click(function(){
            container.toggleClass('small');
        });

        $('.reset', container).click(function(){
            container.trigger('invalidate-size');
        });

        $('.label', container).click(function(){
            var me = $(this),
            all = $('.label', container),
            selectObj = $('select', me.parent()),
            sliderObj = $('input', me.parent());

            // Handle flag visibility
            all.removeClass('active');
            me.addClass('active');

            // Extract active parameter
            if(selectObj.length) {
                activeArgName = selectObj.attr('name');
                activeValueIndex = 0;
                activeValues = [];
                $('option', selectObj).each(function(idx, elm) {
                   activeValues.push($(this).text());
                });
            }
            if(sliderObj.length) {
                activeArgName = sliderObj.attr('name');
                activeValueIndex = sliderObj.val();
                activeValues = sliderObj.attr('data-values').split(':');
            }
        });

        play.click(function(){
            play.hide();
            stop.show();
            keepAnimation = true;
            animate();
        });
        stop.click(function(){
            stop.hide();
            play.show();
            keepAnimation = false;
        });
    }

    // ------------------------------------------------------------------------

    function updateActiveArgument(container, name, value) {
        if(container.data('active-args')[name] !== value) {
            var downloadManager = container.data('download-manager'),
            info = container.data('info');
            container.data('active-args')[name] = value;
            $('span.'+name+'-value', container).html(value);
            downloadManager.clearProcessingQueue();
            fireLoadImage(container);

            // Try to cache all argument values
            if(container.data('preload')) {
                downloadManager.downloadFiles(info['name_pattern'], name, info['arguments'][name]['values'], container.data('active-args'));
            }
        }
    }

    // ========================================================================
    // UI
    // ========================================================================

    var WidgetFactory = {
        "range": function(name, label, values, defaultValue) {
            return templateReplace(SLIDER_TEMPLATE, name, label, values, defaultValue);
        },
        "list": function(name, label, values, defaultValue) {
            var options = [];
            for(var idx in values) {
                options.push(OPTION_TEMPLATE.replace('VALUE', values[idx]));
            }
            return templateReplace(SELECT_TEMPLATE, name, label, [ options.join('') ], defaultValue);
        }
    };

    // ------------------------------------------------------------------------

    function templateReplace( templateString, name, label, values, defaultValue) {
        return templateString.replace(/NAME/g, name).replace(/LABEL/g, label).replace(/VALUES/g, values.join(':')).replace(/SIZE/g, values.length - 1).replace(/DEFAULT/g, defaultValue).replace(/INDEX/g, values.indexOf(defaultValue));
    }

    // ------------------------------------------------------------------------

    function createControlPanel(container, args) {
        var htmlBuffer = [],
        controlContainer = $('<div/>', {
            class: 'control',
            html: '<div class="header"><span class="vtk-icon-tools toggle"/><span class="vtk-icon-resize-full-2 reset"/><span class="vtk-icon-play play"/><span class="vtk-icon-stop stop"/></div><div class="parameters"></div>'
        });

        // Loop over each option
        for (key in args) {
            var name = key,
            type = args[key].type,
            label = args[key].label,
            values = args[key].values,
            defaultValue = args[key]['default'];

            // Update default value
            updateActiveArgument(container, name, defaultValue);

            // Filter out from UI some pre-defined args
            if(EXCLUDE_ARGS.hasOwnProperty(key)) {
                continue;
            }

            // Build widget if needed
            if(values.length > 1) {
                 htmlBuffer.push(WidgetFactory[type](name, label, values, defaultValue));
            }
        }


        // Add control panel to UI
        htmlBuffer.sort();
        $('<ul/>', {
            html: '<li>' + htmlBuffer.join('</li><li>') + '</li>'
        }).appendTo($('.parameters', controlContainer));
        controlContainer.appendTo(container);

        // Attache listeners
        initializeListeners(container);
    }

    // ----------------------------------------------------------------------

    function attachTouchListener(container) {
        var current_button = null, posX, posY, defaultDragButton = 1,
        isZooming = false, isDragging = false, mouseAction = 'up', target;

        function mobileTouchInteraction(evt) {
            evt.gesture.preventDefault();
            switch(evt.type) {
                case 'drag':
                    if(isZooming) {
                        return;
                    }
                    current_button = defaultDragButton;
                    if(mouseAction === 'up') {
                        mouseAction = "down";

                        target = evt.gesture.target;
                        isDragging = true;
                    } else {
                        mouseAction = "move";
                    }

                    posX = evt.gesture.touches[0].pageX;
                    posY = evt.gesture.touches[0].pageY;
                    break;
                case 'hold':
                    if(defaultDragButton === 1) {
                        defaultDragButton = 2;
                        //container.html("Pan mode").css('color','#FFFFFF');
                    } else {
                        defaultDragButton = 1;
                        //container.html("Rotation mode").css('color','#FFFFFF');
                    }

                    break;
                case 'release':
                    //container.html('');
                    current_button = 0;
                    mouseAction = "up";
                    isZooming = false;
                    isDragging = false;
                    break;
                case 'doubletap':
                    container.trigger('resetCamera');
                    return;
                case 'pinch':
                    if(isDragging) {
                        return;
                    }
                    current_button = 3;
                    if(mouseAction === 'up') {
                        mouseAction = 'down';
                        posX = 0;
                        posY = container.height();
                        target = evt.gesture.target;
                        isZooming = true;
                    } else {
                        mouseAction = 'move';
                        posY = container.height() * (1+(evt.gesture.scale-1)/2);
                    }
                    break;
            }

            // Trigger event
            container.trigger({
                type: 'mouse',
                action: mouseAction,
                current_button: current_button,
                charCode: '',
                altKey: false,
                ctrlKey: false,
                shiftKey: false,
                metaKey: false,
                delegateTarget: target,
                pageX: posX,
                pageY: posY
            });
        }

        // Bind listener to UI container
        container.hammer({
            prevent_default : true,
            prevent_mouseevents : true,
            transform : true,
            transform_always_block : true,
            transform_min_scale : 0.03,
            transform_min_rotation : 2,
            drag : true,
            drag_max_touches : 1,
            drag_min_distance : 10,
            swipe : false,
            hold : true // To switch from rotation to pan
        }).on("doubletap pinch drag release hold", mobileTouchInteraction);
    }

    // ------------------------------------------------------------------------

    function createZoomableCanvasObject(container, img, canvas, pixelZoomRatio) {
        // First set up some variables we will need
        var modeRotation = 1,   // when dragging, it's a rotation
        modePan = 2,            // when dragging, it's a pan
        modeZoom = 3,           // when dragging, it's a zoom
        modeNone = 0,           // No mouse move handling
        mouseMode = modeNone,   // Current mode

        dzScale = 0.005,  // scaling factor to control how fast we zoom in and out
        wheelZoom = 0.05, // amount to change zoom with each wheel event

        drawingCenter = [0,0],  // Drawing parameters
        zoomLevel = 1.0,        //

        maxZoom = pixelZoomRatio, // limit how far we can zoom in
        minZoom = 1 / maxZoom,    // limit how far we can zoom out

        lastLocation = [0,0],  // Last place mouse event happened

        // Rotation management vars
        thetaValues, phiValues, stepPhi, stepTheta, currentArgs;

        /*
         * Adds mouse event handlers so that we can pan and zoom the image
         */
        function setupEvents() {
            var element = canvas;

            // Needed this to override context menu behavior
            element.bind('contextmenu', function(evt) { evt.preventDefault(); });

            // Wheel should zoom across browsers
            element.bind('DOMMouseScroll mousewheel', function (evt) {
                var x = (-evt.originalEvent.wheelDeltaY || evt.originalEvent.detail);

                lastLocation = getRelativeLocation(canvas, evt);
                handleZoom((x > 0 ? wheelZoom : x < 0 ? -wheelZoom : 0));
                evt.preventDefault();

                // Redraw the image in the canvas
                redrawImage();
            });

            // Handle mobile
            attachTouchListener(element);
            element.bind('mouse', function(e){
                // action: mouseAction,
                // current_button: current_button,
                // charCode: '',
                // altKey: false,
                // ctrlKey: false,
                // shiftKey: false,
                // metaKey: false,
                // delegateTarget: target,
                // pageX: posX,
                // pageY: posY
                var action = e.action,
                altKey = e.altKey,
                shiftKey = e.shiftKey,
                ctrlKey = e.ctrlKey,
                x = e.pageX,
                y = e.pageY,
                current_button = e.current_button;

                if(action === 'down') {
                    if (e.altKey) {
                        current_button = 2;
                        e.altKey = false;
                    } else if (e.shiftKey) {
                        current_button = 3;
                        e.shiftKey = false;
                    }
                    // Detect interaction mode
                    switch(current_button) {
                        case 2: // middle mouse down = pan
                            mouseMode = modePan;
                            break;
                        case 3: // right mouse down = zoom
                            mouseMode = modeZoom;
                            break;
                        default:
                            mouseMode = modeRotation;
                            break;
                    }

                    // Store mouse location
                    lastLocation = [x, y];

                    e.preventDefault();
                } else if(action === 'up') {
                    mouseMode = modeNone;
                    e.preventDefault();
                } else if(action === 'move') {
                    if(mouseMode != modeNone) {
                        var loc = [x,y];

                        // Can NOT use switch as (modeRotation == modePan) is
                        // possible when Pan should take over rotation as
                        // rotation is not possible
                        if(mouseMode === modePan) {
                            handlePan(loc);
                        } else if (mouseMode === modeZoom) {
                            var deltaY = loc[1] - lastLocation[1];
                            handleZoom(deltaY * dzScale);

                            // Update mouse location
                            lastLocation = loc;
                        } else {
                           handleRotation(loc);
                        }

                        // Redraw the image in the canvas
                        redrawImage();
                    }
                }
            });

            // Zoom and pan events with mouse buttons and drag
            element.bind('mousedown', function(evt) {
                var current_button = evt.which;

                // alt+click simulates center button, shift+click simulates right
                if (evt.altKey) {
                    current_button = 2;
                    evt.altKey = false;
                } else if (evt.shiftKey) {
                    current_button = 3;
                    evt.shiftKey = false;
                }

                // Detect interaction mode
                switch(current_button) {
                    case 2: // middle mouse down = pan
                        mouseMode = modePan;
                        break;
                    case 3: // right mouse down = zoom
                        mouseMode = modeZoom;
                        break;
                    default:
                        mouseMode = modeRotation;
                        break;
                }

                // Store mouse location
                lastLocation = getRelativeLocation(canvas, evt);

                evt.preventDefault();
            });

            // Send mouse movement event to the forwarding function
            element.bind('mousemove', function(e) {
                if(mouseMode != modeNone) {
                    var loc = getRelativeLocation(canvas, e);

                    // Can NOT use switch as (modeRotation == modePan) is
                    // possible when Pan should take over rotation as
                    // rotation is not possible
                    if(mouseMode === modePan) {
                        handlePan(loc);
                    } else if (mouseMode === modeZoom) {
                        var deltaY = loc[1] - lastLocation[1];
                        handleZoom(deltaY * dzScale);

                        // Update mouse location
                        lastLocation = loc;
                    } else {
                       handleRotation(loc);
                    }

                    // Redraw the image in the canvas
                    redrawImage();
                }
            });

            // Stop any zoom or pan events
            element.bind('mouseup', function(evt) {
                mouseMode = modeNone;
                evt.preventDefault();
            });

            // Update rotation handler if possible
            modeRotation = container.data('info').arguments.hasOwnProperty('phi') ? modeRotation : modePan;
            if(modeRotation != modePan) {
                thetaValues = container.data('info').arguments.theta.values;
                phiValues   = container.data('info').arguments.phi.values;
                stepPhi     = phiValues[1] - phiValues[0];
                stepTheta   = thetaValues[1] - thetaValues[0];
                currentArgs = container.data('active-args');
            }
        }

        /*
         * If the data can rotate
         */
        function handleRotation(loc) {
            var currentPhi = currentArgs.phi,
            currentTheta = currentArgs.theta,
            currentPhiIdx = phiValues.indexOf(currentPhi),
            currentThetaIdx = thetaValues.indexOf(currentTheta)
            deltaPhi = (loc[0] - lastLocation[0]),
            deltaTheta = (loc[1] - lastLocation[1]),
            changeDetected = false;

            if(Math.abs(deltaPhi) > stepPhi) {
                changeDetected = true;
                currentPhiIdx += (deltaPhi > 0) ? 1 : -1;
                if(currentPhiIdx >= phiValues.length) {
                    currentPhiIdx -= phiValues.length;
                } else if(currentPhiIdx < 0) {
                    currentPhiIdx += phiValues.length;
                }
                currentArgs['phi'] = phiValues[currentPhiIdx];
            }

            if(Math.abs(deltaTheta) > stepTheta) {
                currentThetaIdx += (deltaTheta > 0) ? 1 : -1;
                if(currentThetaIdx >= thetaValues.length) {
                    currentThetaIdx = thetaValues.length - 1;
                } else if(currentThetaIdx < 0) {
                    currentThetaIdx = 0;
                }
                if(currentArgs['theta'] !== thetaValues[currentThetaIdx]) {
                    currentArgs['theta'] = thetaValues[currentThetaIdx];
                    changeDetected = true;
                }
            }

            if(changeDetected) {
                fireLoadImage(container);
                container.trigger('invalidate-viewport');

                // Update mouse location
                lastLocation = loc;
            }
        }

        /*
         * Does the actual image panning.  Panning should not mess with the
         * source width or source height, those are fixed by the current zoom
         * level.  Panning should only update the source origin (the x and y
         * coordinates of the upper left corner of the source rectangle).
         */
        function handlePan(loc) {
            // Update the source rectangle origin, but afterwards, check to
            // make sure we're not trying to look outside the image bounds.
            drawingCenter[0] += (loc[0] - lastLocation[0]);
            drawingCenter[1] += (loc[1] - lastLocation[1]);

            // Update mouse location
            lastLocation = loc;
        }

        /*
         * Does the actual image zooming.  Zooming first sets what the source width
         * and height should be based on the zoom level, then adjusts the source
         * origin to try and maintain the source center point.  However, zooming
         * must also not try to view outside the image bounds, so the center point
         * may be changed as a result of this.
         */
        function handleZoom(inOutAmount) {
            var beforeZoom = zoomLevel,
            afterZoom = beforeZoom + inOutAmount;

            // Disallow zoomLevel outside allowable range
            if (afterZoom < minZoom) {
                afterZoom = minZoom;
            } else if (afterZoom > maxZoom) {
                afterZoom = maxZoom;
            }

            if(beforeZoom != afterZoom) {
                zoomLevel = afterZoom;
                // FIXME ----------------------------------------------------------------
                // zoom by keeping location of "lastLocation" in the same screen position
                // FIXME ----------------------------------------------------------------
            }
        }

        /*
         * Convenience function to draw the image.  As a reminder, we always fill
         * the entire viewport.  Also, we always use the source origin and source
         * dimensions that we have calculated and maintain internally.
         */
        function redrawImage() {
            var ctx = canvas[0].getContext("2d"),
            w = container.width(),
            h = container.height(),
            iw = img[0].naturalWidth,
            ih = img[0].naturalHeight;

            if(iw === 0) {
                setTimeout(redrawImage, 100);
            } else {
                canvas.attr("width", w);
                canvas.attr("height", h);
                ctx.clearRect(0, 0, w, h);

                var tw = Math.floor(iw*zoomLevel),
                th = Math.floor(ih*zoomLevel),
                tx = drawingCenter[0] - (tw/2),
                ty = drawingCenter[1] - (th/2),
                dx = (tw > w) ? (tw - w) : (w - tw),
                dy = (th > h) ? (th - h) : (h - th),
                centerBounds = [ (w-dx)/2 , (h-dy)/2, (w+dx)/2, (h+dy)/2 ];

                if( drawingCenter[0] < centerBounds[0] || drawingCenter[0] > centerBounds[2]
                    || drawingCenter[1] < centerBounds[1] || drawingCenter[1] > centerBounds[3] ) {
                    drawingCenter[0] = Math.min( Math.max(drawingCenter[0], centerBounds[0]), centerBounds[2] );
                    drawingCenter[1] = Math.min( Math.max(drawingCenter[1], centerBounds[1]), centerBounds[3] );
                    tx = drawingCenter[0] - (tw/2);
                    ty = drawingCenter[1] - (th/2);
                }

                ctx.drawImage(img[0],
                              0,   0, iw, ih,  // Source image   [Location,Size]
                              tx, ty, tw, th); // Traget drawing [Location,Size]
            }
        }

        /*
         * Make sure the image will fit inside container as ZoomOut
         */

        function resetCamera() {
            var w = container.width(),
            h = container.height(),
            iw = img[0].naturalWidth,
            ih = img[0].naturalHeight;

            if(iw === 0) {
                setTimeout(resetCamera, 100);
            } else {
                zoomLevel = minZoom = Math.min( w / iw, h / ih );
                drawingCenter[0] = w/2;
                drawingCenter[1] = h/2;
                redrawImage();
            }
        }

        // Now do some initialization
        setupEvents();
        resetCamera();

        // Just expose a couple of methods that need to be called from outside
        return {
            'resetCamera': resetCamera,
            'imageLoaded': redrawImage
        };
    }

    // ------------------------------------------------------------------------

    function createImageViewer(container, func) {
        var imageContainer = $('<img/>', { class: 'image-viewer' }),
        imageCanvas = $('<canvas/>', { class: 'image-canvas' }),
        currentFileToRender = null;
        imageContainer.appendTo(imageCanvas);
        imageCanvas.appendTo(container);

        // Add zoom manager
        var manipMgr = createZoomableCanvasObject(container, imageContainer, imageCanvas, 10);

        container.bind('invalidate-size', function() {
            manipMgr.resetCamera();
        });
        imageContainer.bind('onload load', function(){
            manipMgr.imageLoaded();
            container.trigger('image-render');
        });
        container.bind('image-loaded', function(event){
            if(currentFileToRender === null || event.url.indexOf(currentFileToRender) != -1) {
                imageContainer.attr('src', event.url);
            }
        });
        container.bind('load-image', function(event){
            currentFileToRender = event.filename;
        });

        return imageCanvas;
    }

    // ========================================================================
    // JQuery
    // ========================================================================

    /**
     * jQuery catalyst view constructor.
     *
     * @member jQuery.vtkCatalystViewer
     * @param basePath
     * Root directory for data to visualize
     */

    $.fn.vtkCatalystViewer = function(dataBasePath, preload) {
        return this.each(function() {
            var me = $(this).empty().addClass('vtk-catalyst-viewer small'); //.unbind();

            // Get meta-data
            $.ajax({
                url: dataBasePath + '/info.json',
                dataType: 'json',
                success: function( data ) {
                    // Store metadata
                    me.data('info', data);
                    me.data('active-args', {});
                    me.data('base-path', dataBasePath);
                    me.data('preload', (preload ? true : false));

                    // Create download manager
                    createDownloadManager(me, 5, dataBasePath);

                    // Create Control UI
                    createControlPanel(me, data.arguments);

                    // Create interactive viewer
                    createImageViewer(me);

                    // Load default image
                    fireLoadImage(me);
                },
                error: function(error) {
                    console.log("error");
                    console.log(error);
                }
            });
        });
    }

    }(jQuery, window));
(function ($, GLOBAL) {
    var CONTENT_TEMPLATE = '<div class="toolbar"><span class="label">Field<select name="field">FIELDS</select></span><span class="label">Probe<select name="probe"><option value="0">X</option><option value="1">Y</option><option value="2">Z</option></select></span> Slice <span class="slice-value txt-feedback">0</span> Time <span class="time-value txt-feedback">0</span></div><div class="control"><div class="header"><span class="vtk-icon-tools toggle"/><span class="vtk-icon-play play"/><span class="vtk-icon-stop stop"/></div><div class="parameters"><div class="label" data-name="slice"><span class="flag vtk-icon-flag"/>Slice<span class="slice-value">0</span></div><input type="range" min="0" max="NB_SLICES" value="0" name="slice"/><div class="label" data-name="time"><span class="flag vtk-icon-flag"/>Time<span class="time-value">0</span></div><input type="range" min="0" max="NB_TIMES" value="0" name="time"/></div></div><div class="image-sample" style="padding: 10px;"><canvas style="border: solid 1px black;"><img/></canvas></div><div class="chart-sample"></div>',
    OPTION_TEMPLATE = '<option>VALUE</option>';

    // ========================================================================
    // Helper
    // ========================================================================

    function getFileName(filePattern, args) {
        var fileName = filePattern;
        for(key in args) {
            fileName = fileName.replace('{'+key+'}', args[key]);
        }
        return fileName;
    }

    // ------------------------------------------------------------------------

    function getOptions(values) {
        var buffer = [];
        for(var idx in values) {
            buffer.push(OPTION_TEMPLATE.replace('VALUE', values[idx]));
        }
        return buffer.join('\n');
    }

    // ------------------------------------------------------------------------

    function update(container) {
        var field = $('select[name="field"]', container).val(),
        slice = $('input[name="slice"]', container).val(),
        time = $('input[name="time"]', container).val(),
        probeAxis = $('select[name="probe"]', container).val();

        downloadJSON(container, slice, probeAxis, field, time);
        downloadImage(container, slice, field, time);
    }

    // ========================================================================
    // Download manager
    // ========================================================================

    function downloadJSON(container, slice, probeAxis, field, time) {
        var sliceList = [],
        cache = container.data('json-cache'),
        info = container.data('info'),
        basepath = container.data('base-path'),
        urls = [];

        if(probeAxis === "2") {
            sliceList = info['arguments']['slice']['values'];
        } else {
            sliceList.push(slice);
        }

        function updateChart(){
            if(0 === urls.length) {
                container.trigger('invalidate-chart');
            }
        }

        function download(fileName) {
            $.getJSON( basepath + '/' + fileName, function(data){
                cache[fileName] = data;
                if(urls.length > 0) {
                    download(urls.pop());
                } else {
                    updateChart();
                }
            }).fail(function(e){
                console.log('Fail to download ' + fileName);
                console.log(e);
            });
        }

        // Fill download queue
        for(var idx in sliceList) {
            var fileName = getFileName(info['name_pattern'], {'field': field, 'slice': sliceList[idx], 'time': time, 'format': 'json'});
            if(!cache.hasOwnProperty(fileName)) {
                urls.push(fileName);
            }
        }

        // Trigger download or update chart
        if(urls.length > 0) {
            download(urls.pop());
        } else {
            updateChart();
        }
    }

    // ------------------------------------------------------------------------

    function downloadImage(container, slice, field, time) {
        var info = container.data('info'),
        basepath = container.data('base-path'),
        fileName = getFileName(info['name_pattern'], {'field': field, 'slice': slice.toString(), 'time': time, 'format': 'jpg'}),
        img = $('img', container);
        img.attr('src', basepath + '/' + fileName);
    }

    // ========================================================================
    // Chart management
    // ========================================================================

    function updateChart(container) {
        var cache = container.data('json-cache'),
        info = container.data('info'),
        probe = container.data('probe-coord'),
        field = $('select[name="field"]', container).val(),
        slice = Number($('input[name="slice"]', container).val()),
        time = $('input[name="time"]', container).val(),
        probeAxis = $('select[name="probe"]', container).val(),
        fileName = getFileName(info['name_pattern'], {'field': field, 'slice': slice, 'time': time, 'format': 'json'}),
        size = [0,0,0],
        offset = 0, step = 0, nbSteps = 0, data = [],
        chartContainer = $(".chart-sample", container);

        if(cache[fileName] === undefined) {
            return;
        }
        size = cache[fileName]["dimensions"];

        function clamp(value) {
            return (value == null || value < -1e10) ? null : value;
        }

        if(probe === undefined) {
            return;
        }

        // Figure out way to traverse
        if(probeAxis === '0') {
            // Along X
            nbSteps = size[0];
            step = 1;
            offset = (size[1] - probe[1]) * size[0];
        } else if(probeAxis === '1') {
            // Along Y
            nbSteps = size[1];
            step = size[0];
            offset = probe[0];
        } else if(probeAxis === '2') {
            // Along Z
            nbSteps = size[2];
            step = -1;
            offset = probe[0] + (size[1] - probe[1]) * size[0];
        }

        // Extract data
        if(probeAxis === '2') {
            sliceList = info['arguments']['slice']['values'];
            // Need multi-files
            for(var idx in sliceList) {
                f = getFileName(info['name_pattern'], {'field': field, 'slice': sliceList[idx], 'time': time, 'format': 'json'});
                sliceDataField = cache[f][field];
                data.push({x: Number(idx), y: clamp(sliceDataField[offset])})
            }
        } else if(probeAxis === '1') {
            // Same slice
            sliceDataField = cache[fileName][field];
            for(var i = 0; i < nbSteps; ++i) {
                data.push({x: i, y: clamp(sliceDataField[offset + (i*step)])})
            }
        } else if(probeAxis === '0') {
            // Same slice
            sliceDataField = cache[fileName][field];
            for(var i = 0; i < nbSteps; ++i) {
                data.push({x: i, y: clamp(sliceDataField[offset + (i*step)])})
            }
        }

        // Update UI with chart
        if(chartContainer.hasClass('vtk-chart')) {
            // Update
            chartContainer.vtkChartUpdateData([ { data: data, color: 'steelblue', name: field } ], true);
            chartContainer.vtkChartConfigure({'chart-padding': [0, 0, 0, 0]});
        } else {
            // Create chart
            chartContainer.vtkChart({
                'legend': {basic: false, toggle: false, highlight: false},
                'renderer': 'line',
                'series': [ { data: data, color: 'steelblue', name: field } ],
                'axes': [ "bottom", "left", "top"],
                'chart-padding': [0, 0, 0, 0]
            });
        }
    }

    // ========================================================================
    // Listeners
    // ========================================================================

    function initializeListeners(container) {
        // Attach redraw callback
        var canvas = $('canvas', container),
        chartContainer = $('.chart-sample', container),
        image = $('img', container),
        enableProbing = false,
        startSliding = false,
        sliders = $('input', container),
        timeSlider = $('input[name="time"]', container),
        sliceSlider = $('input[name="slice"]', container),
        timeTxt = $('span.time-value', container),
        sliceTxt = $('span.slice-value', container),
        activeSlider = null;
        dropDowns = $('select', container),
        currentSlideValue = 0,
        maxSlideValue = 1,
        keepAnimation = false,
        play = $('.play', container),
        stop = $('.stop', container);

        function animate() {
            if(activeSlider) {
                currentSlideValue = (currentSlideValue + 1) % maxSlideValue;
                activeSlider.val(currentSlideValue);
                if(keepAnimation) {
                    setTimeout(animate, 150);
                }
                updateAll();
            }
        }

        // Generic data update
        function updateAll() {
            timeTxt.html(timeSlider.val());
            sliceTxt.html(sliceSlider.val());
            update(container);
            paint();
        }

        // Callback methods to probe data
        function probe(event) {
            if(enableProbing) {
                var offset = canvas.offset(),
                z = $('input[name="slice"]', container).val(),
                scale = image[0].naturalWidth / canvas.width();
                container.data('probe-coord',
                    [Math.floor(scale*(event.pageX - offset.left)), Math.floor(scale*(event.pageY - offset.top)), Number(z)]);
                updateAll();
            }
        }

        // Callback methods to paint image
        function paint() {
            if(image[0].naturalWidth == 0) {
                setTimeout(paint, 100);
                return;
            }

            var ctx = canvas[0].getContext("2d"),
            w = canvas.parent().width(),
            img = image[0],
            ih = img.naturalHeight,
            iw = img.naturalWidth,
            ratio = ih / iw,
            scale = iw / w,
            headHeight = canvas.offset().top - container.offset().top + 22,
            probePoint = container.data('probe-coord');

            canvas.css('left', '20px').attr('width', w + 'px').attr('height', Math.ceil(w*ratio) + 'px');
            chartContainer.css('width', '100%').css('height', (container.height() - Math.ceil(w*ratio) - headHeight) + 'px');
            ctx.drawImage(image[0],
                          0,   // source image upper left x
                          0,   // source image upper left y
                          iw,    // source image width
                          ih,    // source image height
                          0,              // destination canvas upper left x
                          0,              // destination canvas upper left y
                          canvas.width(),     // destination canvas width
                          canvas.height());    // destination canvas height

            // Draw line
            if(probePoint) {
                var probeAxis = $('select[name="probe"]', container).val();
                ctx.strokeStyle = "#000000";
                ctx.fillStyle="#FFFFFF";
                if(probeAxis === '0') {
                    // Along X
                    var y = probePoint[1] / scale;
                    ctx.rect(0,y,canvas.width(), Math.ceil(scale));
                    ctx.stroke();
                    ctx.fill();
                } else if(probeAxis === '1') {
                    // Along Y
                    var x = probePoint[0] / scale;
                    ctx.rect(x,scale,Math.ceil(scale),canvas.height());
                    ctx.stroke();
                    ctx.fill();
                } else if(probeAxis === '2') {
                    // Along Z
                    var x = probePoint[0] / scale, y = probePoint[1] / scale;
                    ctx.beginPath();
                    ctx.arc(x,y,5,0,2*Math.PI);
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }

        // Attach probing listeners
        canvas.bind('mousemove', probe);
        canvas.bind('mouseup', function(){ enableProbing = false; });
        canvas.bind('mousedown', function(e){
            enableProbing = true;
            probe(e);
        });

        // Attach auto-paint listener
        image.bind('load onload', paint);

        // Attach graph update
        container.bind('invalidate-chart', function(){
            updateChart(container);
        });

        // Attach dropDowns listeners
        dropDowns.bind('change', updateAll);

        // Attach slider listener
        sliders.bind('change keyup', updateAll);
        sliders.bind('mousedown', function(){
            startSliding = true;
        });
        sliders.bind('mouseup', function(){
            startSliding = false;
        });
        sliders.bind('mousemove', function(){
            if(startSliding) {
                updateAll();
            }
        });

        $('div.label', container).click(function(){
            var me = $(this),
            all = $('.label', container);

            activeSlider = $('input[name="' + me.attr('data-name') + '"]', container);

            if(activeSlider) {
                currentSlideValue = Number(activeSlider.val());
                maxSlideValue = Number(activeSlider.attr('max'));

                // Handle flag visibility
                all.removeClass('active');
                me.addClass('active');
            }
        });

        $('.toggle', container).click(function(){
            container.toggleClass('small');
        });

        play.click(function(){
            play.hide();
            stop.show();
            keepAnimation = true;
            animate();
        });
        stop.click(function(){
            stop.hide();
            play.show();
            keepAnimation = false;
        });
    }

    // ========================================================================
    // JQuery
    // ========================================================================

    /**
     * jQuery catalyst view constructor.
     *
     * @member jQuery.vtkCatalystViewer
     * @param basePath
     * Root directory for data to visualize
     */

    $.fn.vtkCatalystResamplerViewer = function(dataBasePath) {
        return this.each(function() {
            var me = $(this).empty().addClass('vtk-catalyst-resample-viewer small').unbind();

            // Get meta-data
            $.ajax({
                url: dataBasePath + '/info.json',
                dataType: 'json',
                success: function( data ) {
                    // Store metadata
                    me.data('info', data);
                    me.data('active-args', {});
                    me.data('json-cache', {});
                    me.data('base-path', dataBasePath);

                    // Create UI
                    me.html(CONTENT_TEMPLATE
                        .replace('FIELDS', getOptions(data['arguments']['field']['values']))
                        .replace('NB_SLICES', data['arguments']['slice']['values'].length-1)
                        .replace('NB_TIMES', data['arguments']['time']['values'].length-1)
                    );
                    initializeListeners(me);

                    // Load data
                    update(me);
                },
                error: function(error) {
                    console.log("error when trying to download " + dataBasePath + '/info.json');
                    console.log(error);
                }
            });
        });
    }

    }(jQuery, window));(function ($, GLOBAL) {
    var SELECT_OPTION = '<option value="VALUE">NAME</option>',
    TEMPLATE_CANVAS = '<canvas class="front-renderer"></canvas><canvas class="single-size-back-buffer bg"></canvas><canvas class="back-buffer bg"></canvas>',
    TEMPLATE_CONTENT = '<div class="header"><span class="vtk-icon-tools toggle"></span><span class="vtk-icon-resize-full-2 reset"></span><span class="vtk-icon-play play"></span><span class="vtk-icon-stop stop"></span></div><div class="parameters"><div class="layer-selector"></div><div class="pipeline-container"><div class="pipeline"><ul>PIPELINE</ul></div><div class="background">Background<div class="right-control"><ul><li class="color" data-color="#cccccc" style="background: #cccccc"></li><li class="color" data-color="#000000" style="background: #000000"></li><li class="color" data-color="#ffffff" style="background: #ffffff"></li></ul></div></div><div class="fields"><ul><li class="time loop toggle-active"><span class="vtk-icon-clock-1 action title">Time</span><div class="right-control"><span class="value">0</span><span class="vtk-icon-to-start-1 action vcr" data-action="begin"></span><span class="vtk-icon-left-dir action vcr" data-action="previous"></span><span class="vtk-icon-right-dir action vcr" data-action="next"></span><span class="vtk-icon-to-end-1 action vcr" data-action="end"></span></div></li><li class="phi loop toggle-active"><span class="vtk-icon-resize-horizontal-1 action title">Phi</span><div class="right-control"><span class="value">0</span><span class="vtk-icon-to-start-1 action vcr" data-action="begin"></span><span class="vtk-icon-left-dir action vcr" data-action="previous"></span><span class="vtk-icon-right-dir action vcr" data-action="next"></span><span class="vtk-icon-to-end-1 action vcr" data-action="end"></span></div></li><li class="theta toggle-active"><span class="vtk-icon-resize-vertical-1 action title">Theta</span><div class="right-control"><span class="value">0</span><span class="vtk-icon-to-start-1 action vcr" data-action="begin"></span><span class="vtk-icon-left-dir action vcr" data-action="previous"></span><span class="vtk-icon-right-dir action vcr" data-action="next"></span><span class="vtk-icon-to-end-1 action vcr" data-action="end"></span></div></li><li class="compute-coverage action"><span>Compute pixel coverage</span><div class="right-control"><span class="vtk-icon-sort-alt-down"/></div></li><li class="progress"><div></div></li></ul></div></div></div>',
    PIPELINE_ENTRY = '<li class="show enabled" data-id="ID"><span class="FRONT_ICON action"></span><span class="label">LABEL</span>CONTROL</li>',
    DIRECTORY_CONTROL = '<span class="vtk-icon-plus-circled right-control action select-layer"></span><ul>CHILDREN</ul>',
    TEMPLATE_SELECTOR = '<div class="head"><span class="title">TITLE</span><span class="vtk-icon-ok action right-control validate-layer"></span></div><ul>LIST</ul>',
    TEMPLATE_LAYER_CHECK = '<li><input type="checkbox" CHECKED name="ID">NAME</li>',
    // Extract worker url
    scripts = document.getElementsByTagName('script'),
    scriptPath = scripts[scripts.length - 1].src.split('/'),
    workerURL = '/CatalystBrowser/vtkweb-composite-worker.js',
    NB_RESULT_PER_PAGE = 8;


    // Compute worker path
    scriptPath.pop();
    workerURL = scriptPath.join('/') + workerURL;

    // ========================================================================
    // Helper method
    // ========================================================================

    function getRelativeLocation(element, mouseEvent) {
        var parentOffset = element.offset(),
        x = mouseEvent.pageX || mouseEvent.originalEvent.pageX || mouseEvent.originalEvent.mozMovementX,
        y = mouseEvent.pageY || mouseEvent.originalEvent.pageY || mouseEvent.originalEvent.mozMovementY,
        relX = x - parentOffset.left,
        relY = y - parentOffset.top;
        return [ relX, relY ];
    }

    // ------------------------------------------------------------------------

    function createSearchManager(container, data, basepath) {
        var layerVisibility = {},
            layer_fields = data.metadata.layer_fields,
            fields = data.metadata.fields,
            pipeline = data.metadata.pipeline,
            args = data.arguments,
            idList = [],
            dataList = [],
            result = [],
            layerOlderInvalid = true,
            filePattern = data.name_pattern.replace(/{filename}/g, 'query.json'),
            timeList = args.hasOwnProperty('time') ? args.time.values : ["0"],
            phiList = args.hasOwnProperty('phi') ? args.phi.values : ["0"],
            thetaList = args.hasOwnProperty('theta') ? args.theta.values : ["0"],
            timeCount = timeList.length,
            phiCount = phiList.length,
            thetaCount = thetaList.length,
            workerList = [],
            roundRobinWorkerId = 0,
            formulaSTR = "",
            layerToLabel = {},
            nbImages = 1,
            renderManager = null,
            layerSeriesData = {},
            palette = new Rickshaw.Color.Palette();

        // Compute number of images
        for(var key in layer_fields) {
            nbImages += layer_fields[key].length;
        }
        renderManager = createCompositeManager(container, basepath, data, nbImages);

        // Compute layer to label mapping
        function updateLayerToLabel(item) {
            if(item.type === 'layer') {
                layerToLabel[item.ids[0]] = item.name;
                layerSeriesData[item.ids[0]] = [];
            } else {
                for(var idx in item.children) {
                    updateLayerToLabel(item.children[idx]);
                }
            }
        }
        for(var idx in pipeline) {
            updateLayerToLabel(pipeline[idx]);
        }

        // Create workers
        var nbWorker = 5;
        while(nbWorker--) {
            var w = new Worker(workerURL);
            w.onmessage = processResults;
            workerList.push(w)
        }

        // ------------------------------

        function processResults(event) {
            result.push(event.data);

            var nb = $('.result-founds', container);
            nb.html( Number(nb.html()) + 1);

            if(result.length === idList.length) {
                updateGraph();
                working(false);
            }
        }

        // ------------------------------

        function updateWorkers(query) {
            var wQuery = '_' + query,
            count = workerList.length;
            while(count--) {
                workerList[count].postMessage(wQuery);
            }
        }

        // ------------------------------

        function triggerWork() {
            var count = workerList.length;
            while(count--) {
                workerList[count].postMessage('w');
            }
        }

        // ------------------------------

        function sendData(id, fields, orderCount) {
            workerList[roundRobinWorkerId].postMessage('d' + id + '|' + JSON.stringify(fields) + '|' + JSON.stringify(orderCount));
            roundRobinWorkerId = (roundRobinWorkerId + 1) % workerList.length;
        }

        // ------------------------------

        function sendNumberOfPrixel(number) {
            var sNumber = 's' + number,
            count = workerList.length;
            while(count--) {
                workerList[count].postMessage(sNumber);
            }
        }

        // ------------------------------

        function fetchData(url, fields, count) {
            $.ajax({
                url: url,
                dataType: 'json',
                success: function( data ) {
                    sendData(url, fields, data.counts);
                    if(count == 0) {
                        sendNumberOfPrixel(data.dimensions[0] * data.dimensions[1]);
                    }
                    // Fetch next one
                    processDataList();
                },
                error: function(error) {
                    console.log("error when trying to download " + url);
                    console.log(error);
                }
            });
        }

        // ------------------------------

        var processIdx = 0,
        progressBar = $('.progress > div', container);

        $('.progress', container).show();

        function processDataList() {
            if(processIdx < idList.length) {
                fetchData(idList[processIdx], dataList[processIdx], processIdx);
                processIdx++;
                progressBar.css('width', Math.floor(95*processIdx / idList.length) + '%');

                // Update page number and possible results
                $('.result-count', container).html("Found&nbsp;VALUE&nbsp;results.".replace(/VALUE/g, idList.length));
                $('.result-page-number', container).html(Math.floor(idList.length / NB_RESULT_PER_PAGE) + 1);
            } else {
                $('.compute-coverage', container).show();
                progressBar.parent().hide();

                // Update page number and possible results
                $('.result-count', container).html("Found&nbsp;VALUE&nbsp;results.".replace(/VALUE/g, idList.length));
                $('.result-page-number', container).html(Math.floor(idList.length / NB_RESULT_PER_PAGE) + 1);
            }
        }

        // ------------------------------

        // Generate image list
        while(timeCount--) {
            thetaCount = thetaList.length;
            var baseURL = basepath + '/' + filePattern.replace(/{time}/g, timeList[timeCount]);
            while(thetaCount--) {
                phiCount = phiList.length;
                var currentURL = baseURL.replace(/{theta}/g, thetaList[thetaCount]);
                while(phiCount--) {
                    var url = currentURL.replace(/{phi}/g, phiList[phiCount]);
                    dataList.push({ time: timeList[timeCount], phi: phiList[phiCount], theta: thetaList[thetaCount]});
                    idList.push(url);
                    if(idList.length === 1) {
                        processDataList();
                    }
                }
            }
        }

        // ------------------------------

        function search() {
            result = [];
            working(true);
            $('.result-founds', container).html('0');
            triggerWork();
        }

        // ------------------------------

        function updateGraph() {
            var count = result.length, series = [];

            // Update serie data
            for(var layer in layerSeriesData) {
                layerSeriesData[layer] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            }
            while(count--) {
                var entry = result[count].count;
                for(var layer in entry) {
                    if(layer !== '+') {
                        var percent = Math.ceil(entry[layer]);
                        layerSeriesData[layer][percent]++;
                    }
                }
            }
            // Find max with no coverage
            var max = 0;
            for(var layer in layerSeriesData) {
                count = 101;
                while(count-- && layerSeriesData[layer][count] === 0) {
                    // Just wait to find the right index
                }
                if(max < count) {
                    max = count;
                }
            }
            max += 1;

            for(var layer in layerSeriesData) {
                var name = '(' + layer + ') ' + layerToLabel[layer],
                data = [],
                color = palette.color(),
                hasData = false;

                for(var x = 1; x < max; ++x) {
                    data.push({x:x, y:layerSeriesData[layer][x]});
                    if(layerSeriesData[layer][x] > 0) {
                        hasData = true;
                    }
                }
                if(hasData) {
                    series.push({ name:name, data:data, color:color });
                }
            }

            // Create brand new graph
            var options = {
                'renderer': 'area',  // Type of chart [line, area, bar, scatterplot]
                'stacked' : true,
                'series': series,
                'axes': [ "bottom", "left", "top"], // Draw axis on border with scale
                'chart-padding': [0, 100, 0, 0],   // Graph padding [top, right, bottom, left] in px. Useful to save space for legend
            };
            $('.chart-container', container).empty().vtkChart(options);
        }


        function applyQuery(userQuery) {
            $('.toggle-stats', container).removeClass('stats');
            // Generate function str
            // Extract forumla
            formulaSTR = "var time = Number(obj.fields.time), phi = Number(obj.fields.phi), theta = Number(obj.fields.theta);\n";
            for(var layer in layerVisibility) {
                if(layerVisibility[layer]) {
                    formulaSTR += layer + ' = obj.count.' + layer + ';\n';
                }
            }

            var sortQuery = $('.sortby-expression', container).val(),
            sortFunctionSTR = "function extractValue(obj) {" + formulaSTR + "return " + sortQuery + ";}; return extractValue(a) - extractValue(b);";

            formulaSTR += "return true";
            if(userQuery.trim().length > 0) {
                formulaSTR += " && " + userQuery + ';';
            } else {
                formulaSTR += ';';
            }

            // Compile formula and run it on results
            var func = new Function("obj", formulaSTR),
            count = result.length,
            found = 0,
            finalResults = []
            sortFunc = new Function(["a","b"], sortFunctionSTR);

            $('.result-count', container).html('Found&nbsp;0&nbsp;result.');

            while(count--) {
                if(func(result[count])) {
                   found++;
                   finalResults.push(result[count]);
                }
            }

            if(sortQuery.length > 0) {
                finalResults.sort(sortFunc);
            }

            $('.result-count', container).html("Found&nbsp;VALUE&nbsp;results.".replace(/VALUE/g, found));

            var resultContainer = $('.composite-search-results', container).empty();
            count = finalResults.length,
            nbPages = Math.floor(count / NB_RESULT_PER_PAGE),
            pages = [],
            resultNumber = 0;

            if(count % NB_RESULT_PER_PAGE) {
                ++nbPages;
            }

            $('.result-page-number', container).html(nbPages);

            for(var idx = 0; idx < nbPages; ++idx) {
                var page = $('<div/>', { "class": 'result-page', "data-page": idx });
                page.appendTo(resultContainer);
                pages.push(page);
            }
            pages[0].addClass('active');

            while(count--) {
                addResultToUI(finalResults[count], pages[Math.floor(resultNumber++ / NB_RESULT_PER_PAGE)]);
            }

            // Add render callback
            // $('.composite-result', container).click(function(){
            //     var me = $(this), fields = me.attr('data-fields').split(':'),
            //     time = fields[0], phi = fields[1], theta = fields[2],
            //     imgURL = drawResult(time, phi, theta);
            //     $('img', me).attr('src', imgURL);
            // });

            $('.composite-result', container).dblclick(function(){
                var me = $(this), fields = me.attr('data-fields').split(':');

                var colorContainer = $('.color.active', container);
                if(colorContainer) {
                    container.trigger({
                        type: "open-view",
                        query: container.data('pipeline-query'),
                        args: {
                            time : fields[0],
                            phi : fields[1],
                            theta : fields[2]
                        },
                        color: colorContainer.attr('data-color')
                    });
                } else {
                    me.trigger({
                        type: "open-view",
                        query: container.data('pipeline-query'),
                        args: {
                            time : fields[0],
                            phi : fields[1],
                            theta : fields[2]
                        },
                    });
                }
            });
            renderActivePage();
        }

        // ------------------------------

        function renderActivePage(){
            var processingQueue = [];
            function renderCompositeResult() {
                if(processingQueue.length > 0) {
                    // [ container, time, phi, theta ]
                    var item = processingQueue.pop(),
                    time = item[1], phi = item[2], theta = item[3];
                    if(renderManager.updateFields(time, phi, theta)) {
                        item[0].attr('src', drawResult(time, phi, theta));
                        item[4].hide();
                    } else {
                        // Not ready yet
                        processingQueue.push(item);
                    }

                    // Process remaining
                    setTimeout(renderCompositeResult, 50);
                }
            }
            $('.result-page.active .composite-result', container).each(function(){
                var me = $(this), fields = me.attr('data-fields').split(':'),
                time = fields[0], phi = fields[1], theta = fields[2];
                processingQueue.push([$('img', me), time, phi, theta, $('ul', me)]);
            });
            processingQueue.reverse();
            $('.result-page-index', container).val(1+Number($('.result-page.active').attr('data-page')));
            renderCompositeResult();
        }

        // ------------------------------

        function addResultToUI(obj, container) {
            var buffer = [], dataFields = "";

            dataFields += obj.fields['time'] + ':' + obj.fields['phi'] + ':' + obj.fields['theta'];
            for(var field in obj.fields){
                buffer.push(field + ': ' + obj.fields[field]);
            }
            for(var layer in obj.count){
                if(layer != '+' && obj.count[layer] > 0) {
                    buffer.push(layerToLabel[layer] + ': ' + Number(obj.count[layer]).toFixed(2) + ' %');
                }
            }
            $("<div/>", {
                class: 'composite-result',
                'data-fields': dataFields,
                html: "<ul><li>" + buffer.join('</li><li>') + "</li></ul><img style='width: 100%;'/>"
            }).appendTo(container);
        }

        // ------------------------------

        function updateFields(time, phi, theta) {
            //console.log('search updateFields: ' + time + " " + phi + " " + theta);
        }

        // ------------------------------

        function working(working) {
            $('.working', container).css('visibility', working ? 'visible' : 'hidden');
            if(working) {
                $('.search-action[data-action="render"]', container).addClass('disabled');
            } else {
                $('.search-action[data-action="render"]', container).removeClass('disabled');
            }
        }

        // ------------------------------

        // function updateResult(found, total) {
        //     var nb = $('.result-founds', container),
        //     tot = $('.result-total', container);

        //     nb.html( Number(nb.html()) + found);
        //     tot.html( Number(tot.html()) + total);
        // }

        // ------------------------------

        function draw() {
            //console.log('search draw');
        }

        // ------------------------------

        function drawResult(time, phi, theta) {
            renderManager.updateFields(time, phi, theta);
            renderManager.draw();

            // Extract image and use it inside result
            return renderManager.toDataURL();
        }

        // ------------------------------

        function updatePipeline(query) {
            // update Layer Visibility
            var count = query.length;
            layerOlderInvalid = false;

            for(var idx = 0; idx < count; idx += 2) {
                var layer = query[idx],
                    visibility = (query[idx+1] != '_');

                if(!layerVisibility.hasOwnProperty(layer) || layerVisibility[layer] != visibility) {
                    layerVisibility[layer] = visibility;
                    layerOlderInvalid = true;
                }
            }

            if(layerOlderInvalid) {
                updateWorkers(query);
                $('.chart-container', container).empty();
                $('.composite-search-results', container).empty();
                result = [];
            }

            // Update render manager
            renderManager.updatePipeline(query);
        }

        // ------------------------------

        function updateColor(color) {
            renderManager.updateColor(color);
        }

        // ------------------------------

        function updatePixelRatio(field, value) {

        }

        // ------------------------------

        function updatePixelRatioOrder(field, isPlus) {
            console.log('search updatePixelRatioOrder: ' + field + " " + isPlus);
        }

        // ------------------------------

        return {
            updateFields:updateFields,
            draw:draw,
            updatePipeline:updatePipeline,
            updateColor:updateColor,
            updatePixelRatio:updatePixelRatio,
            updatePixelRatioOrder:updatePixelRatioOrder,
            search: search,
            applyQuery: applyQuery,
            renderActivePage: renderActivePage,
            layerToLabel: layerToLabel
        };
    }

    // ----------------------------------------------------------------------

    function attachTouchListener(container) {
        var current_button = null, posX, posY, defaultDragButton = 1,
        isZooming = false, isDragging = false, mouseAction = 'up', target;

        function mobileTouchInteraction(evt) {
            evt.gesture.preventDefault();
            switch(evt.type) {
                case 'drag':
                    if(isZooming) {
                        return;
                    }
                    current_button = defaultDragButton;
                    if(mouseAction === 'up') {
                        mouseAction = "down";

                        target = evt.gesture.target;
                        isDragging = true;
                    } else {
                        mouseAction = "move";
                    }

                    posX = evt.gesture.touches[0].pageX;
                    posY = evt.gesture.touches[0].pageY;
                    break;
                case 'hold':
                    if(defaultDragButton === 1) {
                        defaultDragButton = 2;
                        //container.html("Pan mode").css('color','#FFFFFF');
                    } else {
                        defaultDragButton = 1;
                        //container.html("Rotation mode").css('color','#FFFFFF');
                    }

                    break;
                case 'release':
                    //container.html('');
                    current_button = 0;
                    mouseAction = "up";
                    isZooming = false;
                    isDragging = false;
                    break;
                case 'doubletap':
                    container.trigger('resetCamera');
                    return;
                case 'pinch':
                    if(isDragging) {
                        return;
                    }
                    current_button = 3;
                    if(mouseAction === 'up') {
                        mouseAction = 'down';
                        posX = 0;
                        posY = container.height();
                        target = evt.gesture.target;
                        isZooming = true;
                    } else {
                        mouseAction = 'move';
                        posY = container.height() * (1+(evt.gesture.scale-1)/2);
                    }
                    break;
            }

            // Trigger event
            container.trigger({
                type: 'mouse',
                action: mouseAction,
                current_button: current_button,
                charCode: '',
                altKey: false,
                ctrlKey: false,
                shiftKey: false,
                metaKey: false,
                delegateTarget: target,
                pageX: posX,
                pageY: posY
            });
        }

        // Bind listener to UI container
        container.hammer({
            prevent_default : true,
            prevent_mouseevents : true,
            transform : true,
            transform_always_block : true,
            transform_min_scale : 0.03,
            transform_min_rotation : 2,
            drag : true,
            drag_max_touches : 1,
            drag_min_distance : 10,
            swipe : false,
            hold : true // To switch from rotation to pan
        }).on("doubletap pinch drag release hold", mobileTouchInteraction);
    }

    // ------------------------------------------------------------------------

    function createZoomableCanvasObject(container, bgCanvas, frontCanvas, pixelZoomRatio, stepPhi, stepTheta) {
        // First set up some variables we will need
        var modeRotation = 1,   // when dragging, it's a rotation
        modePan = 2,        // when dragging, it's a pan
        modeZoom = 3,           // when dragging, it's a zoom
        modeNone = 0,           // No mouse move handling
        mouseMode = modeNone,   // Current mode

        dzScale = 0.005,  // scaling factor to control how fast we zoom in and out
        wheelZoom = 0.05, // amount to change zoom with each wheel event

        drawingCenter = [0,0],  // Drawing parameters
        zoomLevel = 1.0,        //

        maxZoom = pixelZoomRatio, // limit how far we can zoom in
        minZoom = 1 / maxZoom,    // limit how far we can zoom out

        lastLocation = [0,0];  // Last place mouse event happened

        if(stepPhi === 0) {
            modeRotation = modePan;
        }

        /*
         * Adds mouse event handlers so that we can pan and zoom the image
         */
        function setupEvents() {
            var element = frontCanvas;

            // Needed this to override context menu behavior
            element.bind('contextmenu', function(evt) { evt.preventDefault(); });

            // Wheel should zoom across browsers
            element.bind('DOMMouseScroll mousewheel', function (evt) {
                var x = (-evt.originalEvent.wheelDeltaY || evt.originalEvent.detail);

                lastLocation = getRelativeLocation(frontCanvas, evt);
                handleZoom((x > 0 ? wheelZoom : x < 0 ? -wheelZoom : 0));
                evt.preventDefault();

                // Redraw the image in the canvas
                redrawImage();
            });

            // Handle mobile
            attachTouchListener(element);
            element.bind('mouse', function(e){
                // action: mouseAction,
                // current_button: current_button,
                // charCode: '',
                // altKey: false,
                // ctrlKey: false,
                // shiftKey: false,
                // metaKey: false,
                // delegateTarget: target,
                // pageX: posX,
                // pageY: posY
                var action = e.action,
                altKey = e.altKey,
                shiftKey = e.shiftKey,
                ctrlKey = e.ctrlKey,
                x = e.pageX,
                y = e.pageY,
                current_button = e.current_button;

                if(action === 'down') {
                    if (e.altKey) {
                        current_button = 2;
                        e.altKey = false;
                    } else if (e.shiftKey) {
                        current_button = 3;
                        e.shiftKey = false;
                    }
                    // Detect interaction mode
                    switch(current_button) {
                        case 2: // middle mouse down = pan
                            mouseMode = modePan;
                            break;
                        case 3: // right mouse down = zoom
                            mouseMode = modeZoom;
                            break;
                        default:
                            mouseMode = modeRotation;
                            break;
                    }

                    // Store mouse location
                    lastLocation = [x, y];

                    e.preventDefault();
                } else if(action === 'up') {
                    mouseMode = modeNone;
                    e.preventDefault();
                } else if(action === 'move') {
                    if(mouseMode != modeNone) {
                        var loc = [x,y];

                        // Can NOT use switch as (modeRotation == modePan) is
                        // possible when Pan should take over rotation as
                        // rotation is not possible
                        if(mouseMode === modePan) {
                            handlePan(loc);
                        } else if (mouseMode === modeZoom) {
                            var deltaY = loc[1] - lastLocation[1];
                            handleZoom(deltaY * dzScale);

                            // Update mouse location
                            lastLocation = loc;
                        } else {
                           handleRotation(loc);
                        }

                        // Redraw the image in the canvas
                        redrawImage();
                    }
                }
            });

            // Zoom and pan events with mouse buttons and drag
            element.bind('mousedown', function(evt) {
                var current_button = evt.which;

                // alt+click simulates center button, shift+click simulates right
                if (evt.altKey) {
                    current_button = 2;
                    evt.altKey = false;
                } else if (evt.shiftKey) {
                    current_button = 3;
                    evt.shiftKey = false;
                }

                // Detect interaction mode
                switch(current_button) {
                    case 2: // middle mouse down = pan
                        mouseMode = modePan;
                        break;
                    case 3: // right mouse down = zoom
                        mouseMode = modeZoom;
                        break;
                    default:
                        mouseMode = modeRotation;
                        break;
                }

                // Store mouse location
                lastLocation = getRelativeLocation(frontCanvas, evt);

                evt.preventDefault();
            });

            // Send mouse movement event to the forwarding function
            element.bind('mousemove', function(e) {
                if(mouseMode != modeNone) {
                    var loc = getRelativeLocation(frontCanvas, e);

                    // Can NOT use switch as (modeRotation == modePan) is
                    // possible when Pan should take over rotation as
                    // rotation is not possible
                    if(mouseMode === modePan) {
                        handlePan(loc);
                    } else if (mouseMode === modeZoom) {
                        var deltaY = loc[1] - lastLocation[1];
                        handleZoom(deltaY * dzScale);

                        // Update mouse location
                        lastLocation = loc;
                    } else {
                       handleRotation(loc);
                    }

                    // Redraw the image in the frontCanvas
                    redrawImage();
                }
            });

            // Stop any zoom or pan events
            element.bind('mouseup', function(evt) {
                mouseMode = modeNone;
                evt.preventDefault();
            });
        }

        /*
         * If the data can rotate
         */
        function handleRotation(loc) {
            var deltaPhi = (loc[0] - lastLocation[0]),
            deltaTheta = (loc[1] - lastLocation[1]),
            changeDetected = false;

            if(Math.abs(deltaPhi) > stepPhi) {
                changeDetected = true;
                if(deltaPhi > 0) {
                    $('.phi span[data-action="next"]', container).trigger('click');
                } else {
                    $('.phi span[data-action="previous"]', container).trigger('click');
                }
            }

            if(Math.abs(deltaTheta) > stepTheta) {
                changeDetected = true;
                if(deltaTheta > 0) {
                    $('.theta span[data-action="next"]', container).trigger('click');
                } else {
                    $('.theta span[data-action="previous"]', container).trigger('click');
                }
            }

            if(changeDetected) {
                // Update mouse location
                lastLocation = loc;
            }
        }

        /*
         * Does the actual image panning.  Panning should not mess with the
         * source width or source height, those are fixed by the current zoom
         * level.  Panning should only update the source origin (the x and y
         * coordinates of the upper left corner of the source rectangle).
         */
        function handlePan(loc) {
            // Update the source rectangle origin, but afterwards, check to
            // make sure we're not trying to look outside the image bounds.
            drawingCenter[0] += (loc[0] - lastLocation[0]);
            drawingCenter[1] += (loc[1] - lastLocation[1]);

            // Update mouse location
            lastLocation = loc;
        }

        /*
         * Does the actual image zooming.  Zooming first sets what the source width
         * and height should be based on the zoom level, then adjusts the source
         * origin to try and maintain the source center point.  However, zooming
         * must also not try to view outside the image bounds, so the center point
         * may be changed as a result of this.
         */
        function handleZoom(inOutAmount) {
            var beforeZoom = zoomLevel,
            afterZoom = beforeZoom + inOutAmount;

            // Disallow zoomLevel outside allowable range
            if (afterZoom < minZoom) {
                afterZoom = minZoom;
            } else if (afterZoom > maxZoom) {
                afterZoom = maxZoom;
            }

            if(beforeZoom != afterZoom) {
                zoomLevel = afterZoom;
                // FIXME ----------------------------------------------------------------
                // zoom by keeping location of "lastLocation" in the same screen position
                // FIXME ----------------------------------------------------------------
            }
        }

        /*
         * Convenience function to draw the image.  As a reminder, we always fill
         * the entire viewport.  Also, we always use the source origin and source
         * dimensions that we have calculated and maintain internally.
         */
        function redrawImage() {
            var frontCtx = frontCanvas[0].getContext("2d"),
            w = container.width(),
            h = container.height(),
            iw = bgCanvas[0].width,
            ih = bgCanvas[0].height;

            if(iw === 0) {
                setTimeout(redrawImage, 100);
            } else {
                frontCanvas.attr("width", w);
                frontCanvas.attr("height", h);
                frontCtx.clearRect(0, 0, w, h);

                var tw = Math.floor(iw*zoomLevel),
                th = Math.floor(ih*zoomLevel),
                tx = drawingCenter[0] - (tw/2),
                ty = drawingCenter[1] - (th/2),
                dx = (tw > w) ? (tw - w) : (w - tw),
                dy = (th > h) ? (th - h) : (h - th),
                centerBounds = [ (w-dx)/2 , (h-dy)/2, (w+dx)/2, (h+dy)/2 ];

                if( drawingCenter[0] < centerBounds[0] || drawingCenter[0] > centerBounds[2]
                    || drawingCenter[1] < centerBounds[1] || drawingCenter[1] > centerBounds[3] ) {
                    drawingCenter[0] = Math.min( Math.max(drawingCenter[0], centerBounds[0]), centerBounds[2] );
                    drawingCenter[1] = Math.min( Math.max(drawingCenter[1], centerBounds[1]), centerBounds[3] );
                    tx = drawingCenter[0] - (tw/2);
                    ty = drawingCenter[1] - (th/2);
                }

                frontCtx.drawImage(bgCanvas[0],
                              0,   0, iw, ih,  // Source image   [Location,Size]
                              tx, ty, tw, th); // Traget drawing [Location,Size]
            }
        }

        /*
         * Make sure the image will fit inside container as ZoomOut
         */

        function resetCamera() {
            var w = container.width(),
            h = container.height(),
            iw = bgCanvas[0].width,
            ih = bgCanvas[0].height;

            if(iw === 0) {
                setTimeout(resetCamera, 100);
            } else {
                zoomLevel = minZoom = Math.min( w / iw, h / ih );
                drawingCenter[0] = w/2;
                drawingCenter[1] = h/2;
                redrawImage();
            }
        }

        // Now do some initialization
        setupEvents();
        resetCamera();

        // Just expose a couple of methods that need to be called from outside
        return {
            'resetCamera': resetCamera,
            'paint': redrawImage
        };
    }

    // ------------------------------------------------------------------------

    function createCompositeManager(container, basepath, info, nbImages) {
        var activeQuery = "",
        pathPattern = info.name_pattern,
        activeKey = null,
        cache = {},
        orderMapping = {},
        layerOffset = null,
        offsetMap = info.metadata.offset,
        singleImageSize = info.metadata.dimensions,
        fullImageSize = [ singleImageSize[0], singleImageSize[1] * nbImages],
        bgColor = null;

        // Add UI components to container
        $('<div/>', {
            class: 'composite-view',
            html: TEMPLATE_CANVAS
        }).appendTo(container);

        var bgCanvas = $('.back-buffer', container),
        frontCanvas = $('.single-size-back-buffer', container),
        bgCTX = bgCanvas[0].getContext('2d'),
        frontCTX = frontCanvas[0].getContext('2d');

        // Update bg canvas size to match image size
        bgCanvas.attr('width', fullImageSize[0]).attr('height', fullImageSize[1]);
        frontCanvas.attr('width', singleImageSize[0]).attr('height', singleImageSize[1]);

        // Create helper methods
        // -----------------------------------------
        function downloadImage(key, url) {
            var img = new Image();

            function onLoad() {
                cache[key]['image'] = img;
                if(cache[key].hasOwnProperty('json')) {
                    draw();
                }
            }

            function onError() {
                console.log('Error loading image ' + url + ' for key ' + key);
            }

            img.onload = onLoad;
            img.onerror = onError;
            img.src = url;
            if (img.complete) {
                onLoad();
            }
        }

        // -----------------------------------------

        function downloadComposite(key, url) {
            jQuery.getJSON(url, function(data){
                // Process composite
                var composite = data["pixel-order"].split('+'),
                count = composite.length;
                while(count--) {
                    var str = composite[count];
                    if(str[0] === '@') {
                        composite[count] = Number(str.substr(1))
                    } else {
                        if(!orderMapping.hasOwnProperty(str)) {
                            // Compute offset
                            orderMapping[str] = computeOffset(str);
                        }
                    }
                }

                cache[key]['composite'] = composite;
                cache[key]['json'] = data;
                if(cache[key].hasOwnProperty('image')) {
                    draw();
                }
            });
        }

        // -----------------------------------------

        function updateColor(color) {
            bgColor = color;
            draw();
        }

        // -----------------------------------------

        function updateFields(time, phi, theta) {
            activeKey = pathPattern.replace('{time}', time).replace('{phi}', phi).replace('{theta}', theta);

            if(!cache.hasOwnProperty(activeKey)) {
                // Trigger download
                cache[activeKey] = {};
                downloadImage(activeKey, basepath + '/' + activeKey.replace('{filename}', 'rgb.jpg'));
                downloadComposite(activeKey, basepath + '/' + activeKey.replace('{filename}', 'composite.json'));
                return false;
            } else {
                return draw();
            }
        }

        // -----------------------------------------

        function computeOffset(order) {
            var count = order.length;
            for(var i = 0; i < count; ++i) {
                var offset = layerOffset[order[i]];
                if(offset > -1) {
                    return offset;
                }
            }
            return -1;
        }

        // -----------------------------------------

        function computeLayerOffset(query) {
            var count = query.length;
            layerOffset = {};

            for(var i = 0; i < count; i += 2) {
                var layer = query[i],
                field = query[i+1];

                if(field === '_') {
                   layerOffset[layer] = -1;
                } else {
                    layerOffset[layer] = nbImages - offsetMap[query.substr(i,2)] - 1;
                }
            }
        }

        // -----------------------------------------

        function updatePipeline(query) {
            if(activeQuery !== query) {
                activeQuery = query;

                // Update current offset for each layer
                computeLayerOffset(query);

                // Loop over all possible order and compute offset
                for(var order in orderMapping) {
                    orderMapping[order] = computeOffset(order);
                }

                // Render result
                draw();
            }
        }

        // -----------------------------------------

        function draw() {
            if(!cache.hasOwnProperty(activeKey) || !cache[activeKey].hasOwnProperty('composite') || !cache[activeKey].hasOwnProperty('image')) {
                return false;
            }
            var composite = cache[activeKey]['composite'],
            img = cache[activeKey]['image'],
            localOrder = orderMapping,
            fullPixelOffset = singleImageSize[0] * singleImageSize[1] * 4,
            count = composite.length;

            // Fill buffer with image
            bgCTX.drawImage(img, 0, 0);

            var pixelBuffer = bgCTX.getImageData(0, 0, fullImageSize[0], fullImageSize[1]).data,
            frontBuffer = null, frontPixels = null, pixelIdx = 0, localIdx;

            // Fill with bg color
            //if(bgColor) {
            //    frontCTX.fillStyle = bgColor;
            //    frontCTX.fillRect(0,0,singleImageSize[0], singleImageSize[1]);
            //    frontBuffer = frontCTX.getImageData(0, 0, singleImageSize[0], singleImageSize[1]);
            //    frontPixels = frontBuffer.data;
            //} else {
            //    frontBuffer = bgCTX.getImageData(0, (nbImages - 1) * singleImageSize[1], singleImageSize[0], singleImageSize[1]);
            //    frontPixels = frontBuffer.data;
            //}

            // Clear front pixels
            //frontCTX.fillStyle = "#ffffff";
            //frontCTX.fillRect(0,0,singleImageSize[0], singleImageSize[1]);
            frontCTX.clearRect(0, 0, singleImageSize[0], singleImageSize[1]);
            frontBuffer = frontCTX.getImageData(0, 0, singleImageSize[0], singleImageSize[1]);
            frontPixels = frontBuffer.data;

            for(var i = 0; i < count; ++i) {
                var order = composite[i];
                if(order > 0) {
                    pixelIdx += order;
                } else {
                    var offset = localOrder[order];

                    if(offset > -1) {
                        localIdx = 4 * pixelIdx;
                        offset *= fullPixelOffset;
                        offset += localIdx;
                        frontPixels[ localIdx     ] = pixelBuffer[ offset     ];
                        frontPixels[ localIdx + 1 ] = pixelBuffer[ offset + 1 ];
                        frontPixels[ localIdx + 2 ] = pixelBuffer[ offset + 2 ];
                        frontPixels[ localIdx + 3 ] = 255;
                    }
                    // Move forward
                    ++pixelIdx;
                }
            }

            // Draw buffer to canvas
            frontCTX.putImageData(frontBuffer, 0, 0);
            container.trigger('render-bg');
            return true;
        }

        function toDataURL() {
            return frontCanvas[0].toDataURL("image/png");
        }

        return {
            updateFields:updateFields,
            draw:draw,
            updatePipeline:updatePipeline,
            updateColor:updateColor,
            toDataURL:toDataURL,
            search:function(){}
        };
    }

    // ------------------------------------------------------------------------

    function createSelectColorBy(name, availableFields, fields, addRatio) {
        var buffer = [ "<div class='right-control'>" ],
        count = availableFields.length,
        value = null;

        if(count < 2) {
            buffer.push("<select style='display: none;'>");
        } else {
            buffer.push("<select>");
        }

        while(count--) {
            value = availableFields[count];
            buffer.push(SELECT_OPTION.replace(/VALUE/g, value).replace(/NAME/g, fields[value]))
        }
        buffer.push("</select>");

        // Add % slider for query
        if(addRatio) {
            buffer.push("<span class='vtk-icon-zoom-in action ratio-type shift'/><input class='pixel-ratio' type='range' min='0' max='100' value='0' name='FIELD'/><span class='ratio-value shift'>0%</span>".replace(/FIELD/g, name));
        }

        buffer.push("</div>");
        return buffer.join('');
    }

    // ------------------------------------------------------------------------

    function encodeEntry(entry, layer_fields, fields, addRatio) {
        var controlContent = "";

        if(entry['type'] === 'directory') {
            var array = entry['children'],
            count = array.length;
            for(var i = 0; i < count; ++i) {
                controlContent += encodeEntry(array[i], layer_fields, fields, addRatio).replace(/FRONT_ICON/g, 'vtk-icon-cancel-circled remove');
            }
            controlContent = DIRECTORY_CONTROL.replace(/CHILDREN/g, controlContent);
        } else {
           controlContent = createSelectColorBy(entry['ids'][0], layer_fields[entry['ids'][0]], fields, addRatio);
        }

        return PIPELINE_ENTRY.replace(/ID/g, entry['ids'].join(':')).replace(/LABEL/g, entry['name']).replace(/CONTROL/g, controlContent);
    }

    // ------------------------------------------------------------------------

    function createControlPanel(container, pipeline, layer_fields, fields, addRatio) {
        var pipelineBuffer = [], count = pipeline.length;

        // Build pipeline content
        for(var i = 0; i < count; ++i) {
            pipelineBuffer.push(encodeEntry(pipeline[i], layer_fields, fields, addRatio).replace(/FRONT_ICON/g, 'vtk-icon-eye toggle-eye'));
        }

        $('<div/>', {
            class: 'control',
            html: TEMPLATE_CONTENT.replace(/PIPELINE/g, pipelineBuffer.join(''))
        }).appendTo(container);

        $('li > ul > li', container).removeClass('enabled').hide();
    }

    // ------------------------------------------------------------------------

    function initializeListeners(container, manager, zoomableRender) {
        var layers = container.data('layers'),
        animationWorkIndex = 0,
        play = $('.play', container),
        stop = $('.stop', container),
        keepAnimation = false,
        toggleLayer = {};

        function animate() {
            $('.active .vcr[data-action="next"]', container).trigger('click');
            if(keepAnimation) {
                setTimeout(animate, 200);
            }
        }

        function updatePipelineUI(query, args, color, sortValue) {
            var queryObj = {}, count = query.length, queryStr = "", sortStr = sortValue;
            for(var i = 0; i < count; i += 2) {
                queryObj[query[i]] = query[i+1];
            }

            // Update pipeline
            $('.pipeline > ul > li > ul > li', container).hide();
            $('.pipeline li', container).each(function(){
                var me = $(this),
                id = me.attr('data-id'),
                visibleLayer = (queryObj[id] != '_'),
                selectContainer = $('select', me),
                iconContainer = $('.toggle-eye', me);

                selectContainer.val(queryObj[id]);
                iconContainer.removeClass('vtk-icon-eye vtk-icon-eye-off').addClass(visibleLayer ? 'vtk-icon-eye':'vtk-icon-eye-off');
                if(visibleLayer) {
                    me.addClass('show enabled').show();
                } else {
                    me.removeClass('enabled show');
                }
            });

            // Update args
            for(var key in args) {
                var argContainer = $('.'+key, container),
                values = argContainer.attr('data-values').split(':'),
                labelContainer = $('.value', argContainer),
                count = values.length,
                targetValue = args[key];

                while(count--) {
                    if(values[count] == targetValue) {
                        labelContainer.html(targetValue);
                        argContainer.attr('data-index', count);
                        count = 0;
                    }
                }

                // Update Query STR
                queryStr += " && " + key + " == " + targetValue;
            }
            queryStr = queryStr.substr(4);

            // Update color
            $('.color').removeClass('active');
            if(color) {
                $('.color[data-color="' + color + '"]', container).addClass('active');
            }

            // Render the new content
            updatePipeline();
            updateComposite();
            manager.updateColor(color);

            // Update query if search mode
            queryExp = $('.query-expression', container);
            sortExp = $('.sortby-expression', container);
            if(queryExp) {
                queryExp.val(queryStr);
                if(sortStr) {
                    sortExp.val(sortStr);
                }
                setTimeout(function(){
                    $('.compute-coverage', container).trigger('click');
                    setTimeout(function(){
                        queryExp.trigger('change');
                    }, 600);
                }, 100);
            }
        }
        container.bind('updateControl', function(event){
            updatePipelineUI(event.query, event.args, event.color, event.sort);
        });

        function updatePipeline() {
            var query = "";

            for(var i in layers) {
                layer = layers[i];
                query += layer;
                var layerContainer = $('li[data-id="'+layer+'"]', container);
                if(layerContainer.hasClass('show') && layerContainer.hasClass('enabled')) {
                    query += $('select:eq(0)', layerContainer).val();
                    toggleLayer[layer] = true;
                } else {
                    query += '_';
                    toggleLayer[layer] = false;
                }
            }
            container.data('pipeline-query', query);
            manager.updatePipeline(query);
        }

        function extractFieldValue(fieldContainer) {
            return fieldContainer.attr('data-values').split(':')[Number(fieldContainer.attr('data-index'))];
        }

        function updateComposite() {
            var time = extractFieldValue($('.time', container)),
            phi = extractFieldValue($('.phi', container)),
            theta = extractFieldValue($('.theta', container));
            manager.updateFields(time, phi, theta);
            container.data('args', {time:time, phi:phi, theta:theta});
        }

        $('.color', container).click(function(){
            var me = $(this),
            hasColor = me.hasClass('active'),
            color = me.attr('data-color');

            if(!hasColor) {
                $('.color', me.parent()).removeClass('active');
            }
            me.toggleClass('active');

            manager.updateColor(hasColor ? null : color);
        });

        $('.toggle', container).click(function(){
            container.toggleClass('small');
        });

        $('.toggle-active', container).click(function(){
            $(this).toggleClass('active');
        });

        $('.reset', container).click(function(){
            if(zoomableRender) {
                zoomableRender.resetCamera();
            }
        });

        $('.toggle-eye', container).click(function(){
            var me = $(this),
            isVisible = me.hasClass('vtk-icon-eye'),
            all = $('li', me.parent());
            me.removeClass('vtk-icon-eye vtk-icon-eye-off')
              .addClass(isVisible ? 'vtk-icon-eye-off' : 'vtk-icon-eye');

            // Update class for pipeline
            all.removeClass('show');
            me.parent().removeClass('show');
            if(!isVisible) {
                all.addClass('show');
                me.parent().addClass('show');
            }

            updatePipeline();

            // Update query if search mode
            var queryExp = $('.query-expression', container);
            if(queryExp) {
                setTimeout(function(){
                    $('.compute-coverage', container).trigger('click');
                    setTimeout(function(){
                        queryExp.trigger('change');
                    }, 600);
                }, 100);
            }
        });

        $('.remove', container).click(function(){
            $(this).parent().removeClass('enabled').hide();
            updatePipeline();
        });

        $('.vcr', container).click(function(){
            var me = $(this),
            action = me.attr('data-action'),
            root = me.closest('li'),
            idx = Number(root.attr('data-index')),
            size = Number(root.attr('data-size')),
            values = root.attr('data-values').split(':'),
            valueContainer = $('.value', root),
            canLoop = root.hasClass('loop'),
            changeFound = false;

            root.toggleClass('active');
            switch(action) {
                case 'begin':
                    idx = 0;
                break;
                case 'previous':
                    if(canLoop || idx > 0) {
                        idx = (idx + size - 1) % size;
                        changeFound = true;
                    }
                break;
                case 'next':
                    if(canLoop || idx + 1 < size) {
                        idx = (idx + 1) % size;
                        changeFound = true;
                    }
                break;
                case 'end':
                    idx = size -1;
                break;
            }
            root.attr('data-index', idx);
            valueContainer.html(values[idx]);

            if(changeFound) {
                updateComposite();
            }
        });

        $('select', container).change(updatePipeline);

        $('.select-layer', container).click(function(){
            var me = $(this),
            pipelineContainer = $('.pipeline-container', container),
            layerSelector = $('.layer-selector', container),
            title = me.parent().children('span.label:eq(0)').html(),
            buffer = [];

            $('span.label', me.parent().children('ul')).each(function(){
                var me = $(this);
                buffer.push(TEMPLATE_LAYER_CHECK.replace(/ID/g, me.parent().attr('data-id')).replace(/NAME/g, me.html()).replace(/CHECKED/g, me.is(":visible") ? "checked=''" : ""));
            });

            layerSelector.empty()[0].innerHTML = TEMPLATE_SELECTOR.replace(/TITLE/g, title).replace(/LIST/g, buffer.join(''));

            // add listeners
            $('.validate-layer', layerSelector).click(function(){
                pipelineContainer.show();
                layerSelector.hide();

                updatePipeline();

                // Update query if search mode
                var queryExp = $('.query-expression', container);
                if(queryExp) {
                    setTimeout(function(){
                        $('.compute-coverage', container).trigger('click');
                        setTimeout(function(){
                            queryExp.trigger('change');
                        }, 600);
                    }, 100);
                }
            });
            $('input', layerSelector).change(function(){
                var me = $(this),
                checked = me.is(':checked'),
                id = me.attr('name'),
                item = $('li[data-id="' + id + '"]', container);

                if(checked) {
                    item.addClass("enabled show").show();
                } else {
                    item.removeClass("enabled show").hide();
                }
            });

            pipelineContainer.hide();
            layerSelector.show();
        });

        play.click(function(){
            animationWorkIndex = 0;
            play.hide();
            stop.show();
            keepAnimation = true;
            animate();
        });
        stop.click(function(){
            stop.hide();
            play.show();
            keepAnimation = false;
        });

        // Forward render call to front buffer
        container.bind('render-bg', function(){
            if(zoomableRender) {
                zoomableRender.paint();
            }
        });

        // Process current config
        updatePipeline();
        updateComposite();

        // ===== Search based UI =====

        $('.compute-coverage', container).click(function(){
            var pipelineContainer = $('.control', container), maxWidth = $(window).width();
            $('.chart-container', container).css('height', pipelineContainer.height()).css('width', maxWidth - pipelineContainer.width() - 50);
            updatePipeline();
            manager.search();
        });

        $('.query-expression', container).bind('change keyup', function(e){
            // Apply search
            if(e.type === 'keyup' && e.keyCode !== 13) {
                return;
            }
            var me = $(this), userQuery = me.val();
            manager.applyQuery(userQuery);
        });
        $('.sortby-expression', container).bind('change keyup', function(e){
            // Apply search
            if(e.type === 'keyup' && e.keyCode !== 13) {
                return;
            }
            var me = $('.query-expression', container), userQuery = me.val();
            manager.applyQuery(userQuery);
        });

        $('.toggle-stats', container).click(function(){
            var me = $(this), shouldShow = me.toggleClass('stats').hasClass('stats');
            if(shouldShow) {
                $('.composite-search-results .composite-result > ul', container).show();
            } else {
                $('.composite-search-results .composite-result > ul', container).hide();
            }
        });

        $('.page-result-action', container).bind('click change',function(){
            var me = $(this),
            action = me.attr('data-action'),
            pages = $('.composite-search-results .result-page', container),
            activePage = $('.composite-search-results .result-page.active', container),
            activeIdx = Number(activePage.attr("data-page")),
            nbPages = pages.length;

            pages.removeClass('active');

            if(action === "first") {
                $('.result-page[data-page=0]', container).addClass('active');
            } else if(action === "previous") {
                $('.result-page[data-page='+((nbPages + activeIdx - 1)%nbPages)+']', container).addClass('active');
            } else if(action === "next") {
                $('.result-page[data-page='+((activeIdx + 1)%nbPages)+']', container).addClass('active');
            } else if(action === "last") {
                $('.result-page[data-page='+(nbPages - 1)+']', container).addClass('active');
            } else if(action === "go-to") {
                var newIdx = Number($('.result-page-index', container).val()) - 1;
                $('.result-page[data-page='+newIdx+']', container).addClass('active');
            }
            manager.renderActivePage();
        });

        // $('.render-all-composites', container).click(function(){
        //     $('.composite-result', container).trigger('click');
        // });
    }

    /**
     * jQuery catalyst view constructor.
     *
     * @member jQuery.vtkCatalystCompositeViewer
     * @param basePath
     * Root directory for data to visualize
     */

    $.fn.vtkCatalystCompositeViewer = function(dataBasePath) {
        return this.each(function() {
            var me = $(this).unbind().empty().addClass('vtkweb-catalyst-composite small');

            // Get meta-data
            $.ajax({
                url: dataBasePath + '/info.json',
                dataType: 'json',
                success: function( data ) {
                    // Extract info to local vars
                    var layer_fields = data.metadata.layer_fields,
                    fields = data.metadata.fields,
                    pipeline = data.metadata.pipeline,
                    args = data.arguments,
                    nbImages = 1,
                    deltaPhi = (args.hasOwnProperty('phi')) ? (Number(args.phi.values[1]) - Number(args.phi.values[0])) : 0,
                    deltaTheta = (args.hasOwnProperty('theta')) ? (Number(args.theta.values[1]) - Number(args.theta.values[0])) : 0;

                    // Compute number of images
                    for(var key in layer_fields) {
                        nbImages += layer_fields[key].length;
                    }

                    // Keep data info
                    me.data('basepath', dataBasePath);
                    me.data('layers', data.metadata.layers);

                    // Add control UI
                    createControlPanel(me, pipeline, layer_fields, fields, false);

                    // Add rendering view
                    var manager = createCompositeManager(me, dataBasePath, data, nbImages);
                    me.data('compositeManager', manager);

                    var zoomableRender = createZoomableCanvasObject(me, $('.single-size-back-buffer', me), $('.front-renderer', me), 10, deltaPhi, deltaTheta);
                    me.data('zoomableRender', zoomableRender);

                    // Enable additional fields if any (time, phi, theta)
                    for(var key in args) {
                        var fieldContainer = $('.' + key, me);
                        if(fieldContainer) {
                            fieldContainer.attr('data-values', args[key].values.join(':')).attr('data-index', '0').attr('data-size', args[key].values.length);
                            fieldContainer.show();
                        }
                    }

                    // Attach interaction listeners
                    initializeListeners(me, manager, zoomableRender);

                    $('.front-renderer', me).dblclick(function(){
                        var colorContainer = $('.color.active', me);
                        if(colorContainer) {
                            me.trigger({
                                type: "open-view",
                                query: me.data('pipeline-query'),
                                args: me.data('args'),
                                color: colorContainer.attr('data-color')
                            });
                        } else {
                            me.trigger({
                                type: "open-view",
                                query: me.data('pipeline-query'),
                                args: me.data('args')
                            });
                        }
                    });
                },
                error: function(error) {
                    console.log("error when trying to download " + dataBasePath + '/info.json');
                    console.log(error);
                }
            });
        });
    }

    /**
     * jQuery catalyst composite search constructor.
     *
     * @member jQuery.vtkCatalystCompositeSearch
     * @param basePath
     * Root directory for data to visualize
     */

    $.fn.vtkCatalystCompositeSearch = function(dataBasePath) {
        return this.each(function() {
            var me = $(this).unbind().empty().addClass('vtkweb-catalyst-analysis-composite-search vtkweb-catalyst-composite');

            // Get meta-data
            $.ajax({
                url: dataBasePath + '/info.json',
                dataType: 'json',
                success: function( data ) {
                    // Extract info to local vars
                    var layer_fields = data.metadata.layer_fields,
                    fields = data.metadata.fields,
                    pipeline = data.metadata.pipeline,
                    args = data.arguments,
                    searchManager = createSearchManager(me, data, dataBasePath);

                    // Keep data info
                    me.data('basepath', dataBasePath);
                    me.data('layers', data.metadata.layers);

                    // Add control UI
                    createControlPanel(me, pipeline, layer_fields, fields, false);

                    // Enable additional fields if any (time, phi, theta)
                    var helpTxt = "", excludeList = {"filename": true, "field": true},
                    layerVarNames = "<hr/>";
                    for(var key in args) {
                        if(key === 'layer') {
                            continue;
                        }
                        var fieldContainer = $('.' + key, me);
                        if(fieldContainer) {
                            // Add documentation
                            var help = "<b>NAME</b>: VALUES <br/>".replace(/NAME/g, key),
                            values = args[key]["values"];
                            if(args[key]['type'] === 'range') {
                                values = "[MIN to MAX % MODULO]".replace(/MIN/g, values[0]).replace(/MAX/g, values[values.length - 1]).replace(/MODULO/g, (Number(values[1]) - Number(values[0])));
                            }
                            help = help.replace(/VALUES/g, values);
                            if(!excludeList.hasOwnProperty(key)) {
                                helpTxt += help;
                            }

                            fieldContainer.attr('data-values', args[key].values.join(':')).attr('data-index', '0').attr('data-size', args[key].values.length);
                        }
                    }

                    // Create layer labels
                    for(var key in searchManager.layerToLabel) {
                        layerVarNames += "<b>NAME</b>: VALUES <br/>".replace(/NAME/g, key).replace(/VALUES/g, searchManager.layerToLabel[key]);
                    }
                    helpTxt += layerVarNames;

                    // Add search/results containers
                    $('<div/>', {class: "chart-container"}).appendTo(me);
                    $('<div/>', {class: "search-toolbar", html: '<div class="table"><span class="cell"><b>Query</b></span><span class="cell expand"><input type="text" class="query-expression"></span><span class="cell"><b>Sort&nbsp;by</b></span><span class="cell expand"><input type="text" class="sortby-expression"></span><span class="cell"><span class="result-count"></span></span><span class="cell"><span class="vtk-icon-info-1 toggle-stats action" title="Toggle statistics"></span></span><span class="cell"><ul><li class="vtk-icon-to-start-1 action page-result-action" data-action="first"></li><li class="vtk-icon-left-dir-1 action page-result-action" data-action="previous"></li><li><input type="text" value="1" class="result-page-index page-result-action" data-action="go-to"></li><li> / </li><li class="result-page-number"></li><li class="vtk-icon-right-dir-1 action page-result-action" data-action="next"></li><li class="vtk-icon-to-end-1 action page-result-action" data-action="last"></li></ul></span></div></div><i>HELP</i>'.replace(/HELP/g, helpTxt)}).appendTo(me);
                    $('<div/>', {class: "composite-search-results"}).appendTo(me);

                    initializeListeners(me, searchManager, null);
                },
                error: function(error) {
                    console.log("error when trying to download " + dataBasePath + '/info.json');
                    console.log(error);
                }
            });
        });
    }
}(jQuery, window));(function ($, GLOBAL) {
    var SLIDER_TEMPLATE = 'PRIORITY<div class="label"><span class="flag vtk-icon-flag"/>LABEL<span class="NAME-value">DEFAULT</span></div><input type="range" min="0" max="SIZE" value="INDEX" name="NAME" data-values="VALUES"/>',
    SELECT_TEMPLATE = 'PRIORITY<div class="label select"><span class="flag vtk-icon-flag"/>LABEL<select name="NAME">VALUES</select></div>',
    OPTION_TEMPLATE = '<option SELECTED>VALUE</option>',
    EXCLUDE_ARGS = { "theta": true };

    // ========================================================================
    // Listeners
    // ========================================================================

    function initializeListeners(container) {
        var play = $('.play', container),
        stop = $('.stop', container),
        activeArgName = null,
        activeValues = [],
        activeValueIndex = 0,
        keepAnimation = false;

        function animate_callback() {
            if(keepAnimation) {
                setTimeout(animate, 150);
            }
        }

        function animate() {
            if(activeArgName !== null) {
                activeValueIndex++;
                activeValueIndex = activeValueIndex % activeValues.length;
                updateActiveArgument(container, activeArgName, activeValues[activeValueIndex], animate_callback);
            }
        }

        // Attach slider listener
        $('input[type="range"]', container).bind('change keyup',function(){
            var slider = $(this),
            name = slider.attr('name'),
            values = slider.attr('data-values').split(":"),
            idx = slider.val();

            updateActiveArgument(container, name, values[idx]);
        });

        // Attach select listener
        $('select', container).change(function(){
            var select = $(this),
            name = select.attr('name'),
            value = select.val();

            updateActiveArgument(container, name, value);
        });

        $('.toggle', container).click(function(){
            container.toggleClass('small');
        });

        $('.reset', container).click(function(){
            container.data('viewport').resetCamera();
        });

        $('.label', container).click(function(){
            var me = $(this),
            all = $('.label', container),
            selectObj = $('select', me.parent()),
            sliderObj = $('input', me.parent());

            // Handle flag visibility
            all.removeClass('active');
            me.addClass('active');

            // Extract active parameter
            if(selectObj.length) {
                activeArgName = selectObj.attr('name');
                activeValueIndex = 0;
                activeValues = [];
                $('option', selectObj).each(function(idx, elm) {
                   activeValues.push($(this).text());
                });
            }
            if(sliderObj.length) {
                activeArgName = sliderObj.attr('name');
                activeValueIndex = sliderObj.val();
                activeValues = sliderObj.attr('data-values').split(':');
            }
        });

        play.click(function(){
            play.hide();
            stop.show();
            keepAnimation = true;
            animate();
        });
        stop.click(function(){
            stop.hide();
            play.show();
            keepAnimation = false;
        });
    }

    // ------------------------------------------------------------------------

    function updateActiveArgument(container, name, value, callback) {
        if(container.data('active-args')[name] !== value) {
            info = container.data('info');
            container.data('active-args')[name] = value;
            $('span.'+name+'-value', container).html(value);

            container.data('session').call("catalyst.active.argument.update", [name, value]).then(function(){
                container.data('viewport').render(callback);
            });
        }
    }

    // ========================================================================
    // UI
    // ========================================================================

    var WidgetFactory = {
        "range": function(name, label, values, defaultValue, priority) {
            return templateReplace(SLIDER_TEMPLATE, name, label, values, defaultValue, priority);
        },
        "list": function(name, label, values, defaultValue, priority) {
            var options = [];
            for(var idx in values) {
                var selected = (values[idx] === defaultValue) ? 'selected="selected"' : '';
                options.push(OPTION_TEMPLATE.replace('VALUE', values[idx]).replace('SELECTED', selected));
            }
            return templateReplace(SELECT_TEMPLATE, name, label, [ options.join('') ], defaultValue, priority);
        }
    };

    // ------------------------------------------------------------------------

    function templateReplace( templateString, name, label, values, defaultValue, priority) {
        return templateString.replace(/NAME/g, name).replace(/LABEL/g, label).replace(/VALUES/g, values.join(':')).replace(/SIZE/g, values.length - 1).replace(/DEFAULT/g, defaultValue).replace(/INDEX/g, values.indexOf(defaultValue)).replace(/PRIORITY/g, "                          ".substring(0,priority));
    }

    // ------------------------------------------------------------------------

    function createControlPanel(container, args) {
        var htmlBuffer = [],
        controlContainer = $('<div/>', {
            class: 'control',
            html: '<div class="header"><span class="vtk-icon-tools toggle"/><span class="vtk-icon-resize-full-2 reset"/><span class="vtk-icon-play play"/><span class="vtk-icon-stop stop"/></div><div class="parameters"></div>'
        });

        // Loop over each option
        for (key in args) {
            var name = key,
            type = args[key].type,
            label = args[key].label,
            values = args[key].values,
            priority = args[key].priority,
            defaultValue = args[key]['default'];

            // Update default value
            updateActiveArgument(container, name, defaultValue);

            // Filter out from UI some pre-defined args
            if(EXCLUDE_ARGS.hasOwnProperty(key)) {
                continue;
            }

            // Build widget if needed
            if(values.length > 1) {
                 htmlBuffer.push(WidgetFactory[type](name, label, values, defaultValue, priority));
            }
        }

        // Add control panel to UI
        htmlBuffer.sort();
        $('<ul/>', {
            html: '<li>' + htmlBuffer.join('</li><li>') + '</li>'
        }).appendTo($('.parameters', controlContainer));
        controlContainer.appendTo(container);

        // Attache listeners
        initializeListeners(container);
    }

    // ========================================================================
    // JQuery
    // ========================================================================

    /**
     * jQuery catalyst view constructor.
     *
     * @member fn.vtkCatalystPVWeb
     * @param basePath
     * Root directory for data to visualize
     */

     $.fn.vtkCatalystPVWeb = function(dataBasePath) {
        return this.each(function() {
            var me = $(this).empty().addClass('vtk-catalyst-pvweb small'); //.unbind();

            // Get meta-data
            $.ajax({
                url: dataBasePath + '/info.json',
                dataType: 'json',
                success: function( data ) {
                    // Store metadata
                    me.data('info', data);
                    me.data('active-args', {});

                    var config = {
                        sessionManagerURL: vtkWeb.properties.sessionManagerURL,
                        application: data['apps'],
                        dataDir: data["working_dir"],
                        type: data['pipeline-type']
                    },
                    stop = vtkWeb.NoOp,
                    start = function(connection) {
                        // Create viewport
                        var viewport = vtkWeb.createViewport({session:connection.session}),
                        session = connection.session;
                        me.data('viewport', viewport);
                        me.data('session', session);

                        viewport.bind(me[0]);

                        // Init pipeline
                        if(data.hasOwnProperty('configuration')) {
                           session.call("catalyst.pipeline.initialize", [data["configuration"]]).then(function(){
                              viewport.render();
                           },function(e){
                              console.log(e);
                           });
                        }

                        // Load files
                        if(data.hasOwnProperty('files')) {
                           session.call("catalyst.file.open", [data["files"]]).then(function(){
                              viewport.render();
                           },function(e){
                              console.log(e);
                           });
                        }

                        // Create Control UI
                        session.call("catalyst.arguments.get").then(function(args){
                            createControlPanel(me, args);
                        });

                        // Update stop method to use the connection
                        stop = function() {
                            session.call('application.exit.later', [5]).then(function() {
                                try {
                                    connection.connection.close();
                                } catch (closeError) {
                                    console.log(closeError);
                                }
                            }, function(err) {
                                console.log(err);
                            });
                        }

                        $('.close',me.parent()).click(stop);
                    };

                    // Try to launch the Viz process
                    vtkWeb.smartConnect(config, start, function(code,reason){
                        alert(reason);
                    });
                },
                error: function(error) {
                    console.log("error");
                    console.log(error);
                }
            });
        });
    }

    /**
     * Alternate jQuery catalyst view constructor.
     *
     * @member fn.vtkCatalystPVWeb
     * @param basePath
     * Root directory for data to visualize
     */

     $.fn.vtkCatalystPVWebDirect = function(data) {
        // FIXME: This function and the above function should be refactored
        // FIXME: together to avoid duplicated code.
        return this.each(function() {
            var me = $(this).empty().addClass('vtk-catalyst-pvweb small'); //.unbind();

            // Store metadata
            me.data('info', data);
            me.data('active-args', {});

            var stop = vtkWeb.NoOp,
            start = function(connection) {
                // Create viewport
                var viewport = vtkWeb.createViewport({session:connection.session}),
                session = connection.session;
                me.data('viewport', viewport);
                me.data('session', session);

                viewport.bind(me[0]);

                // Init pipeline
                if(data.hasOwnProperty('configuration')) {
                    session.call("catalyst.pipeline.initialize", [data["configuration"]]).then(function(){
                        viewport.render();
                    },function(e){
                        console.log("There was an error calling 'catalyst.pipeline.initialize':");
                        console.log(e);
                    });
                }

                // Load files
                if(data.hasOwnProperty('files')) {
                    session.call("catalyst.file.open", [data["files"]]).then(function(){
                        viewport.render();
                    },function(e){
                        console.log("There was an error calling 'catalyst.file.open':");
                        console.log(e);
                    });
                }

                // Create Control UI
                session.call("catalyst.arguments.get").then(function(args) {
                    createControlPanel(me, args);
                }, function(err) {
                    console.log("There was an error calling 'catalyst.arguments.get':");
                    console.log(err);
                });

                // Update stop method to use the connection
                stop = function() {
                    session.call('application.exit.later', [5]).then(function() {
                        try {
                            connection.connection.close();
                        } catch (closeError) {
                            console.log("Caught exception calling connection.close():");
                            console.log(closeError);
                        }
                    }, function(err) {
                        console.log("There was an error calling 'application.exit.later':");
                        console.log(err);
                    });
                }

                me.bind('stop-vtk-connection', stop);
            };

            // Try to launch the Viz process
            vtkWeb.connect(data, start, function(code,reason){
                console.log(reason);
            });
        });
    }

}(jQuery, window));
(function ($, GLOBAL) {
    var SEARCH_TEMPLATE = '<div class="search-toolbar"><b>Query</b><input type="text" class="query-expression"/><b>Sort&nbsp;by</b><input type="text" class="sort-expression"/><input type="range" min="10" max="100" value="10" class="zoom-level"/><span class="result-count"></span><span class="vtk-icon-chart-area toggle-stats stats action search-button"></span><span class="vtk-icon-picture-1 render-all action search-button" title="Render all images" alt="Render all images"></span><i>HELP</i></div><div class="query-results"></div>',
    TOOLBAR_TEMPLATE = '<div class=sub-menu><ul class="menu left"><li class="vtk-icon-list-add sub action" data-type="composite-image-stack"><ul></ul></li><li class="vtk-icon-chart-line sub action" data-type="catalyst-resample-viewer"><ul></ul></li><li class="vtk-icon-loop-alt sub action" data-type="catalyst-viewer"><ul></ul></li></ul><ul class="menu right"><li class="search-title"/></ul></div><div class="search-panel"></div>',
    ENTRY_TEMPLATE = '<li class="create-search" data-path="PATH" data-title="TITLE">TITLE<i class=help>DESCRIPTION</i></li>',
    SEARCH_FACTORY = {
        "catalyst-viewer": function(domToFill, path) {
            domToFill.vtkCatalystAnalysisGenericSearch(path);
        },
        "catalyst-resample-viewer" : function(domToFill, path) {
            domToFill.vtkCatalystAnalysisGenericSearch(path);
        },
        "composite-image-stack" : function(domToFill, path) {
            domToFill.vtkCatalystCompositeSearch(path);
        },
        "catalyst-pvweb" : function(domToFill, path) {
            domToFill.empty().html("<p style='padding: 20px;font-weight: bold;'>This type of data is not searchable.</p>");
        }
    };

    // ------------------------------------------------------------------------

    function getFileName(filePattern, args) {
        var fileName = filePattern;
        for(key in args) {
            fileName = fileName.replace('{'+key+'}', args[key]);
        }
        return fileName;
    }

    // ------------------------------------------------------------------------

    function buildFileNames(info, basePath) {
        var results = [],
        args = info['arguments'],
        pattern = info['name_pattern'],
        keyNames = [],
        valueCounts = [],
        valueIndexes = [];

        // Fill args infos
        for(var key in args) {
            keyNames.push(key);
            valueCounts.push(args[key]['values'].length);
            valueIndexes.push(0);
        }

        function keepGoing() {
            var count = valueCounts.length;
            while(count--) {
                if(valueCounts[count] != valueIndexes[count] + 1) {
                    return true;
                }
            }
            return false;
        }

        function increment() {
            var idx = 0;
            valueIndexes[idx]++;

            while(valueIndexes[idx] % valueCounts[idx] === 0) {
                valueIndexes[idx] = 0;
                idx++;
                valueIndexes[idx]++;
            }
        }

        function getCurrentArgs() {
            var result = {},
            count = keyNames.length;
            while(count--) {
                result[keyNames[count]] = args[keyNames[count]]["values"][valueIndexes[count]];
            }

            return result;
        }

        while(keepGoing()) {
            var currentArgs = getCurrentArgs(),
            url = basePath + '/' + getFileName(pattern, currentArgs);

            results.push( { "args": currentArgs, "url": url, "keep": true } );

            // Move to next possibility
            increment();
        }

        return results;
    }

    // ------------------------------------------------------------------------

    function extractQueryDocumentation(info) {
         var txtBuffer = [],
         args = info["arguments"],
         template = "<b>KEY</b>: [VALUES]<br/>",
         values = null;

         for(var key in args) {
            values = args[key]["values"];
            if(args[key]['type'] === 'range') {
               var txt = "";
               txt += values[0];
               txt += " to ";
               txt += values[values.length - 1];
               txt += " % ";
               txt += (Number(values[1]) - Number(values[0]));
               values = txt;
            }
            txtBuffer.push(template.replace(/KEY/g, key).replace(/VALUES/g, values));
         }

         return txtBuffer.join('');
    }

    // ------------------------------------------------------------------------

    function filterBy(container, expression) {
        var functionStr = 'var LOCAL_VARS; return (EXP);',
        template = 'ARG = args["ARG"]',
        localVarsStr = [],
        validator = null,
        all = container.data('data-list'),
        firstArgs = all[0]['args'],
        count = all.length,
        nbValidResults = 0;

        // Generate filter function
        for(var key in firstArgs) {
            localVarsStr.push(template.replace(/ARG/g, key));
        }
        functionStr = functionStr.replace(/LOCAL_VARS/g, localVarsStr.join(',')).replace(/EXP/g, expression);
        validator = new Function('args', functionStr);

        // Apply function
        while(count--) {
            all[count]['keep'] = validator(all[count]["args"]);
            if(all[count]['keep']) {
                nbValidResults++;
            }
        }

        return nbValidResults;
    }

    // ------------------------------------------------------------------------

    function showResults(container) {
        var results = container.data('data-list'),
        resultContainer = $('.query-results', container),
        imageList = [],
        count = results.length,
        sortQuery = $('.sort-expression', container).val(),
        imgStr = '<div class="query-result" data-url="URL"><div class="query-stats">STATS</div><img class="image-result"/></div>';

        // Sort results if possible
        if(sortQuery.trim().length > 0) {
            var exposeVars = "var noop = 0";
            for(var key in results[0]['args']) {
                exposeVars += ', ' + key + ' = obj.args["' + key + '"]';
            }
            exposeVars += ';';

            var sortFunctionSTR = "function extractValue(obj) {" + exposeVars + "return " + sortQuery + ";}; return extractValue(a) - extractValue(b);",
            sortFunc = new Function(["a","b"], sortFunctionSTR);
            results.sort(sortFunc);
        }

        while(count--) {
            if(results[count]['keep']) {
                imageList.push(imgStr.replace(/URL/g, results[count]['url']).replace(/STATS/g, JSON.stringify(results[count]["args"]).replace(/["{}]/g,'').replace(/,/g,'<br/>').replace(/:/g,' : ')));
            }
        }

        resultContainer.empty()[0].innerHTML = imageList.join('');
        $('.toggle-stats', container).addClass('stats');
        $('.zoom-level', container).trigger('change');
        $('.query-result', container).click(function(){
            var me = $(this), img = $('img', me), url = me.attr('data-url');
            img.attr('src', url);
        });
    }

    // ------------------------------------------------------------------------

    function initializeListeners(container) {
        var query = $('.query-expression', container),
        zoom = $('.zoom-level', container),
        sort = $('.sort-expression', container),
        resultCountTxt = $('.result-count', container),
        toggleStats = $('.toggle-stats', container),
        renderAll = $('.render-all', container),
        resultCount = 0;

        query.change(function(){
            resultCount = filterBy(container, query.val());
            if(resultCount < 500) {
                showResults(container);
            }
            resultCountTxt.html("Found VAL results.".replace(/VAL/g, resultCount));
        });

        zoom.bind('change mousemove keyup', function(){
            var widthRef = $(window).width() * Number($(this).val()) / 100.0;
            $('.query-result', container).css('width', widthRef).css('height', widthRef);
        })

        sort.bind('change keyup', function(e){
            // Apply search
            if(e.type === 'keyup' && e.keyCode !== 13) {
                return;
            }
            query.trigger('change');
        });

        toggleStats.click(function(){
            var me = $(this).toggleClass('stats'), isActive = me.hasClass('stats');
            if(isActive) {
                $('.query-stats').show();
            } else {
                $('.query-stats').hide();
            }
        });

        renderAll.click(function(){
            $('.query-result', container).each(function(){
                var me = $(this), img = $('img', me), url = me.attr('data-url');
                img.attr('src', url);
            });
        });
    }

    /**
     * jQuery catalyst view constructor.
     *
     * @member jQuery.vtkCatalystViewer
     * @param basePath
     * Root directory for data to visualize
     */

    $.fn.vtkCatalystAnalysisGenericSearch = function(dataBasePath) {
        return this.each(function() {
            var me = $(this).unbind().empty().addClass('vtkweb-catalyst-analysis-search');

            // Get meta-data
            $.ajax({
                url: dataBasePath + '/info.json',
                dataType: 'json',
                success: function( data ) {
                    // Store metadata
                    me.data('info', data);

                    // Build file list
                    me.data('data-list', buildFileNames(data, dataBasePath));

                    // Build UI
                    me.html(SEARCH_TEMPLATE.replace(/HELP/g, extractQueryDocumentation(data)));

                    // Attach interaction listeners
                    initializeListeners(me);
                },
                error: function(error) {
                    console.log("error when trying to download " + dataBasePath + '/info.json');
                    console.log(error);
                }
            });
        });
    }

    /**
     * jQuery catalyst view constructor.
     *
     * @member jQuery.vtkCatalystViewer
     * @param basePath
     * Root directory for data to visualize
     */

    $.fn.vtkCatalystAnalysisSearch = function(project, dataBasePath) {
        return this.each(function() {
            var me = $(this).unbind().empty().html(TOOLBAR_TEMPLATE),
            menu = $('.menu.left', me),
            buffer = [],
            analysis = project.analysis,
            count = analysis.length,
            containers = {
                "composite-image-stack" : $('.menu.left > li[data-type="composite-image-stack"] > ul', me),
                "catalyst-resample-viewer" : $('.menu.left > li[data-type="catalyst-resample-viewer"] > ul', me),
                "catalyst-viewer" : $('.menu.left > li[data-type="catalyst-viewer"] > ul', me)
            },
            buffers = { "composite-image-stack" : [], "catalyst-resample-viewer" : [], "catalyst-viewer" : [], "catalyst-pvweb" : [] },
            rootContainer = me;

            // Fill buffers
            while(count--) {
                var item = analysis[count];
                buffers[item.type].push(ENTRY_TEMPLATE.replace(/PATH/g, dataBasePath + '/' + item.id).replace(/TITLE/g, item.title).replace(/DESCRIPTION/g, item.description));
            }

            // Update UI
            for(var key in containers) {
                containers[key].html(buffers[key].join(''));
            }

            // Attach search query listeners
            $('.create-search', me).addClass('action').click(function(){
                var me = $(this),
                path = me.attr('data-path'),
                type = me.parent().parent().attr('data-type'),
                title = me.attr('data-title'),
                searchPanel = $('.search-panel', rootContainer).removeClass().addClass('search-panel').unbind().empty();

                $('.search-title', rootContainer).html(title);
                SEARCH_FACTORY[type](searchPanel, path);
            });
        });
    }

    }(jQuery, window));(function ($, GLOBAL) {
    var TOOLBAR_TEMPLATE = '<ul class=toolbar-main><li class="logo"/><li class="vtk-icon-menu-1 toggle-button run-button" data-animation="left" data-group=runs data-view="run-content">Runs</li><li class="vtk-icon-info-1 toggle-button need-project default-toggle" data-group="content" data-view="info-content" alt="Toggle Informations" title="Toggle Informations"/><li class="vtk-icon-th toggle-button need-project" data-group=content data-view="bench-content" alt="Toggle Exploration" title="Toggle Exploration"/><li class="vtk-icon-beaker toggle-button need-project" data-group=content data-view="search-content" alt="Toggle Search" title="Toggle Search"/><li class="vtk-icon-dollar toggle-button need-project" data-group=content data-view="cost-content" alt="Toggle Cost" title="Toggle Cost"/><li class="vtk-icon-gauge-1 toggle-button right" data-group=content data-view="estimate-content" alt="Data exploration cost estimate" title="Data exploration cost estimate"/><li class="vtk-icon-user-add-1 toggle-button need-project right" data-group=content data-view="share-content" alt="Share active project" title="Share active project"/></ul><ul class="toggle-content run-content" data-group=runs></ul><div class="info-content toggle-content" data-group=content></div><div class="bench-content toggle-content" data-group="content"></div><div class="search-content toggle-content" data-group=content></div><div class="cost-content toggle-content" data-group="content"></div><div class="share-content toggle-content" data-group="content">The current version does not support user management.</div><div class="estimate-content toggle-content" data-group="content">COST ESTIMATE</div>',
    RUN_LINE_TEMPLATE = '<li class=select-run data-path=PATH>TITLE<i class=help>DESCRIPTION</i></li>',
    TABLE_LINE_TEMPLATE = '<tr><td class="key">KEY</td><td class="value">VALUE</td></tr>';


    // ========================================================================
    // Helper
    // ========================================================================

    function projectInfoToHTML(info, path) {
        var projectDescription = "<table>",
        exclude = { "title": 1, "description": 1, "analysis": 1, "path": 1 };

        // Update project description
        projectDescription += TABLE_LINE_TEMPLATE.replace(/KEY/g, "Name").replace(/VALUE/g, info.title);
        projectDescription += TABLE_LINE_TEMPLATE.replace(/KEY/g, "Description").replace(/VALUE/g, info.description);
        for(var key in info) {
            if(!exclude.hasOwnProperty(key)) {
                projectDescription += TABLE_LINE_TEMPLATE.replace(/KEY/g, key).replace(/VALUE/g, info[key]);
            }
        }
        projectDescription += "</table>";

        return projectDescription;
    }

    // ------------------------------------------------------------------------

    function handlePath(fullPath, projectPath) {
        if(projectPath.indexOf("http://") === 0 || projectPath.indexOf("https://") === 0 || projectPath.indexOf("file://") === 0) {
            return projectPath;
        } else {
            // Relative path
            var basePath = fullPath.substr(0, 1 + fullPath.lastIndexOf("/"));
            return basePath + projectPath;
        }
    }

    // ------------------------------------------------------------------------

    function createControlToolbar(container, projectList, fullURL) {
        // Fill run list
        var count = projectList.length, buffer = [];
        while(count--) {
            buffer.push(RUN_LINE_TEMPLATE.replace(/PATH/g, handlePath(fullURL, projectList[count].path)).replace(/TITLE/g, projectList[count].title).replace(/DESCRIPTION/g, projectList[count].description));
        }
        container.html(TOOLBAR_TEMPLATE);
        $('.run-content', container).html(buffer.join(''));
    }

    // ------------------------------------------------------------------------

    function initializeListeners(container) {
        // Handle view/button toggle
        $('.toggle-button', container).addClass('action').click(function(){
            var me = $(this),
            group = me.attr('data-group'),
            view = me.attr('data-view'),
            animation = me.attr('data-animation'),
            isActive = me.hasClass('active'),
            buttons = $('.toggle-button[data-group="' + group + '"]', container),
            contents = $('.toggle-content[data-group="' + group + '"]', container);

            // Disable all
            buttons.removeClass('active');
            if(animation && isActive) {
                contents.animate({
                    left: "-1000"
                }, 500, function() {
                    // Animation complete.
                    contents.hide();
                });
            } else {
                contents.hide();
            }


            // Enable local one if not previously active
            if(!isActive) {
                me.addClass('active');
                if(animation) {
                    $('.toggle-content.' + view, container).show().animate({
                        left: "0"
                    }, 500, function() {
                        // Animation complete.
                    });
                } else {
                    $('.toggle-content.' + view, container).show();
                }
            } else {
                $('.default-toggle[data-group="' + group + '"]', container).trigger('click');
            }
        });

        // Load run
        $('.select-run', container).addClass('action').click(function(){
            var me = $(this), basePath = me.attr('data-path');

            // Load project
            $.ajax({
                url: basePath + '/info.json',
                dataType: 'json',
                success: function( data ) {
                    $('.toggle-button[data-group="runs"]', container).click();

                    // Store metadata
                    container.data('project', data);

                    // Add project description / viewers / search / cost
                    $('.info-content', container).empty().html(projectInfoToHTML(data, basePath));
                    $('.bench-content', container).vtkCatalystAnalysisBench(data, basePath);
                    $('.search-content', container).vtkCatalystAnalysisSearch(data, basePath);
                    $('.cost-content', container).vtkCatalystAnalysisCost(data, basePath);

                    // Update title
                    document.title = data.title;

                    // Show default
                    $('.default-toggle[data-group="content"]', container).trigger('click');
                },
                error: function(error) {
                    console.log("error when trying to download " + basePath + '/info.json');
                    console.log(error);
                }
            });

            // Enable toolbar
            $('li.need-project', container).css('display', "inline");
        });
    }

    /**
     * jQuery catalyst view constructor.
     *
     * @member jQuery.vtkCatalystViewer
     * @param basePath
     * Root directory for data to visualize
     */

    $.fn.vtkCatalystAnalysis = function(fullURL) {
        return this.each(function() {
            var me = $(this).unbind().empty().addClass('vtkweb-catalyst-analysis');

            // Get meta-data
            $.ajax({
                url: fullURL,
                dataType: 'json',
                success: function( data ) {
                    // Store metadata
                    me.data('projects', data);

                    // Create project list
                    createControlToolbar(me, data, fullURL);

                    // Attach interaction listeners
                    initializeListeners(me);

                    // Add general purpose cost estimate
                    $('.estimate-content',me).vtkCatalystAnalysisCostEstimate();
                },
                error: function(error) {
                    console.log("error when trying to download " + fullURL);
                    console.log(error);
                }
            });
        });
    }

    }(jQuery, window));/**
 * VTK-Web Widget Library.
 *
 * This module extend jQuery object to add support for graphical components
 * related to 2D chart visualization. This widget depends on D3 and Rickshaw.
 *
 * @class jQuery.vtk.ui.Chart
 */
(function ($) {

    // =======================================================================
    // ==== Defaults constant values =========================================
    // =======================================================================
    var GRAPH_HTML_TEMPLATE = [
        "<div class='vtk-legend'></div>",
        "<div class='vtk-top' style='left: AXIS_SIZE px; top: 0px; height: AXIS_SIZE px; position: absolute;'></div>",
        "<div class='vtk-left' style='left: 0 px; top: AXIS_SIZE px; width: AXIS_SIZE px; position: absolute;'></div>",
        "<div class='vtk-center' style='left: AXIS_SIZE px; top: AXIS_SIZE px; position: relative;'></div>",
        "<div class='vtk-right' style='right: 0px; top: AXIS_SIZE px; position: absolute;'></div>",
        "<div class='vtk-bottom' style='left: AXIS_SIZE px; bottom: 0px; position: absolute;'></div>",
        "<div class='vtk-annotation' style='left: AXIS_SIZE px; bottom: 0px; position: absolute;'></div>"
    ];

    // =======================================================================

    function toNumber(str) {
        return Number(str.replace(/^\s+|\s+$/g, ''));
    }

    // =======================================================================

    function extractColumnHeaderMap(headerLine) {
        var header = headerLine.split(','),
        colIdxMap = {};
        for(var idx in header) {
            colIdxMap[header[idx]] = idx;
        }
        return colIdxMap;
    }

    // =======================================================================

    function singleDataCSVConverter(inputString, outputSeries, options) {
        var lines = inputString.split('\n'),
        data = [],
        serie = $.extend({data:data}, options),
        nbLines = lines.length;

        // Process data
        for(var i = 1; i < nbLines; ++i) {
            var values = lines[i].split(',');
            if(values.length === 2) {
                item = { x: toNumber(values[0]), y: toNumber(values[1]) };
                if(isNaN(item.y)) {
                    item.y = null;
                }
                data.push(item);
            }
        }
        outputSeries.push(serie);
    }

    // =======================================================================

    function multiDataCSVConverter(inputString, outputSeries, options) {
        var lines = inputString.split('\n'),
        header = lines[0].split(','),
        headerMap = extractColumnHeaderMap(lines[0]),
        nbLines = lines.length,
        nbValuesByLines = header.length,
        xHeaderName = options['x'],
        xIdx = headerMap[xHeaderName],
        series = [],
        palette = new Rickshaw.Color.Palette();

        if(options.hasOwnProperty('palette') && options['palette'] !== null) {
            palette = options['palette'];
        }

        // Remove time field
        header.splice(header.indexOf(xHeaderName), 1);

        // Create series
        for(var idx in header) {
            var serie = {
                data: [],
                color: palette.color(),
                name: header[idx]
            };

           series.push(serie);
           outputSeries.push(serie);
        }

        // Process data
        for(var i = 1; i < nbLines; ++i) {
            var values = lines[i].split(',');
            if(values.length === nbValuesByLines) {
                xValue =  toNumber(values[xIdx]);
                for(var idx in header) {
                    var item = { x: xValue, y: toNumber(values[headerMap[header[idx]]])};
                    if(isNaN(item.y)) {
                        item.y = null;
                    }
                    if(!isNaN(item.x)) {
                        series[idx].data.push(item);
                    }
                }
            }
        }
    }

    // =======================================================================

    function updateLegend(container) {
        var legendContainer = $('.vtk-legend', container),
        chart = container.data('chart'),
        legend = chart['legends'].basic;

        // Empty UI
        legendContainer.children("ul").empty();

        // Update model
        if(legend !== undefined) {
            legend.lines = [];
            var series = chart.graph.series.map( function(s) { return s } )
            series.forEach(function(s) {
                legend.addLine(s);
            });
        }
    }

    // =======================================================================

    /**
     * Method used to create a 2D chart based on some available data.
     *
     * @member jQuery.vtk.ui.Chart
     * @method vtkChart
     * @param {Object} configuration
     *
     * Usage:
     *      var options = {
     *         'renderer': 'line',  // Type of chart [line, area, bar, scatterplot]
     *         'stacked' : false,
     *         'series': [
     *            {
     *                data: [ { x:0, y:0 }, { x:100, y:10 }, { x:200, y:5 }, { x:300, y:20 }, { x:400, y:25 }, { x:1000, y:-10 } ],
     *                color: 'steelblue',
     *                name: 'field 0'
     *            },{
     *                data: [ { x:0, y:20 }, { x:100, y:30 }, { x:200, y:25 }, { x:300, y:40 }, { x:400, y:55 }, { x:1000, y:-10 } ],
     *                color: 'lightblue',
     *                name: 'field 1'
     *            }
     *        ],
     *        'axes': [ "bottom", "left", "top"], // Draw axis on border with scale
     *        'chart-padding': [0, 150, 50, 0],   // Graph padding [top, right, bottom, left] in px. Useful to save space for legend
     *      };
     *
     *      $('.chart-container-div').vtkChart(options);
     */

    $.fn.vtkChart = function(options) {
        // Handle data with default values
        var opts = $.extend({},$.fn.vtkChart.defaults, options);

        return this.each(function() {
            var me = $(this).empty().addClass('vtk-chart'),
            container = $("<div/>", {
                html: GRAPH_HTML_TEMPLATE.join('').replace(/AXIS_SIZE /g, opts.axisThickness)
            }),
            chartContainer = $('.vtk-center', container),
            legendContainer = $('.vtk-legend', container),
            axisContainer = {
                bottom: $('.vtk-bottom', container)[0],
                top: $('.vtk-top', container)[0],
                left: $('.vtk-left', container)[0],
                right: $('.vtk-right', container)[0]
            },
            annotationContainer = $('.vtk-annotation', container);
            me.append(container);
            // container.css('width', (opts['width']+(2*opts.axisThickness)) + 'px');

            var graphOptions = {
                element: chartContainer[0],
                width: opts['width'],
                height: opts['height'],
                renderer: opts['renderer'],
                min: 'auto',
                stroke: true,
                series: opts['series']
            },
            graph = new Rickshaw.Graph(graphOptions),
            axes = [],
            legends = {},
            annotator = null,
            data = {
                configuration: graphOptions,
                options: opts,
                palette: new Rickshaw.Color.Palette(),
                graph: graph,
                axes: axes,
                legends: legends
            };

            graph.renderer.unstack = !opts.stacked;
            graph.render();

            // Complete graph accessories
            // => Axis
            for(var idx in opts.axes) {
                var orientation = opts.axes[idx], axis = null;
                if(orientation === 'top' || orientation === 'bottom') {
                    axis = new Rickshaw.Graph.Axis.X({graph: graph, orientation: orientation, element: axisContainer[orientation]});
                } else {
                    axis = new Rickshaw.Graph.Axis.Y({graph: graph, orientation: orientation, element: axisContainer[orientation]});
                }
                axes.push(axis);
            }
            // => Legend
            if(opts.legend.basic) {
                legends['basic'] = new Rickshaw.Graph.Legend({graph: graph, element: legendContainer[0]});
                // if(opts.legend.toggle) {
                //     legends['toggle'] = new Rickshaw.Graph.Behavior.Series.Toggle({graph: graph, legend: legends['basic']});
                // }
                // if(opts.legend.highlight) {
                //     legends['highlight'] = new Rickshaw.Graph.Behavior.Series.Highlight({graph: graph, legend: legends['basic']});
                // }
            }
            // => Hover
            if(opts.hover !== null) {
                data['hover'] = new Rickshaw.Graph.HoverDetail({
                    graph: graph,
                    xFormatter: opts.hover.xFormatter,
                    yFormatter: opts.hover.yFormatter
                });
            }
            // => Annotation
            data['annotator'] = new Rickshaw.Graph.Annotate({
                graph: graph,
                element: annotationContainer[0]
            });
            for(var idx in opts.annotations) {
                var annotation = opts.annotations[idx];
                data['annotator'].add(annotation['time'], annotation['message']);
            }

            // Handle auto-resize
            if(opts.autosize) {
                function autoResize() {
                    var w = $(window),
                    padding = opts['chart-padding'],
                    thickness = opts.axisThickness,
                    size = { width: me.width() - (2*thickness) - (padding[1] + padding[3]), height: me.height() - (2*thickness) - (padding[0] + padding[2])};
                    $('.vtk-bottom, .vtk-top, .vtk-annotation', me).css('height', thickness +'px').css('width', size['width'] +'px');
                    $('.vtk-left, .vtk-right', me).css('width', thickness +'px').css('height', size['height'] +'px');
                    $('.vtk-right', me).css('right', padding[1] + 'px').css('top', (padding[0] + thickness) + 'px');
                    $('.vtk-left', me).css('left', padding[3] + 'px').css('top', (padding[0] + thickness) + 'px');
                    $('.vtk-top', me).css('top', padding[0] + 'px').css('left', (thickness+padding[3]) + 'px');
                    $('.vtk-bottom, .vtk-annotation', me).css('left', (thickness+padding[3]) + 'px');
                    $('.vtk-bottom', me).css('bottom', padding[2] + 'px');
                    $('.vtk-center', me).css('width', (size['width'] - 2*thickness - (padding[1] + padding[3]))+'px').css('height', (size['height'] - 2*thickness - (padding[0] + padding[2]))+'px').css('left', (padding[3]+thickness) + 'px').css('top', (padding[0]+thickness) + 'px');

                    data.graph.configure(size);
                    data.graph.update();
                }

                $(window).resize(autoResize).trigger('resize');
            }

            // Save data
            me.data('chart', data);
            graph.render();
        });
    };

    // =======================================================================
    /**
     * Method used to update the data of the 2D chart.
     *
     * @member jQuery.vtk.ui.Chart
     * @method vtkChartUpdateData
     * @param {Array} series
     * @param {boolean} replace previous series
     *
     * Usage:
     *      var series: [
     *         {
     *            data: [ { x:0, y:0 }, { x:100, y:10 }, { x:200, y:5 }, { x:300, y:20 }, { x:400, y:25 }, { x:1000, y:-10 } ],
     *            color: 'steelblue',
     *            name: 'field 0'
     *         },{
     *            data: [ { x:0, y:20 }, { x:100, y:30 }, { x:200, y:25 }, { x:300, y:40 }, { x:400, y:55 }, { x:1000, y:-10 } ],
     *            color: 'lightblue',
     *            name: 'field 1'
     *         }
     *      ];
     *
     *      $('.chart-container-div').vtkChartUpdateData(series);
     */
    $.fn.vtkChartUpdateData = function(series, replace) {
        return this.each(function() {
            var me = $(this),
            data = me.data('chart'),
            dataset = data['configuration']['series'];
            if(replace) {
                while(dataset.length > 0) {
                    dataset.pop();
                }
            }
            for(var idx in series) {
                data.graph.series.push(series[idx]);
            }
            data.graph.validateSeries(data.graph.series);
            data.graph.update();
            updateLegend(me);
        });
    }

    // =======================================================================

    /**
     * Method used to update the data of the 2D chart.
     *
     * @member jQuery.vtk.ui.Chart
     * @method vtkChartFetchData
     * @param {Object} options
     *
     * Usage:
     *      var options_json = { replace: true, url: "data.json", type: 'json', converter: null };
     *      var options_csv_1 = { replace: true, url: "data1.csv", type: 'csv-xy', options: { name: 'Temperature', color: palette.color(), ... } };
     *      var options_csv_n = { replace: true, url: "data2.csv", type: 'csv-x*', options: { x: 'time', palette: null } };
     *
     *      $('.chart-container-div').vtkChartFetchData(options_*);
     *
     * Where data looks like:
     *
     *     data.json
     *       [
     *         {
     *            data: [ { x:0, y:0 }, { x:100, y:10 }, { x:200, y:5 }, { x:300, y:20 }, { x:400, y:25 }, { x:1000, y:-10 } ],
     *            color: 'steelblue',
     *            name: 'field 0'
     *         },{
     *            data: [ { x:0, y:20 }, { x:100, y:30 }, { x:200, y:25 }, { x:300, y:40 }, { x:400, y:55 }, { x:1000, y:-10 } ],
     *            color: 'lightblue',
     *            name: 'field 1'
     *         }
     *       ]
     *
     *
     *     data1.csv
     *     x,y
     *     0,0
     *     1,0.234
     *     2,0.5
     *     2.5,7
     *
     *
     *     data2.csv
     *     time,x,y,z
     *     0,0,0,0
     *     1,0.234,1.2,7.6
     *     2,0.5,3,6
     *     2.5,7,8,9
     */
    $.fn.vtkChartFetchData = function(info) {
        return this.each(function() {
            var me = $(this),
            data = me.data('chart'),
            options = info['options'];

            $.ajax({
                url: info.url,
                dataType: "text"
            }).done(function(data){
                var series = [];
                if (info.type === 'json') {
                    series = $.parseJSON(data);
                } else if(info.type === 'csv-xy') {
                    singleDataCSVConverter(data, series, options);
                } else if(info.type === 'csv-x*') {
                    multiDataCSVConverter(data, series, options);
                }
                me.vtkChartUpdateData(series, info['replace']);
            });
        });
    }

    // =======================================================================
    /**
     * Method used to update the data of the 2D chart.
     *
     * @member jQuery.vtk.ui.Chart
     * @method vtkChartConfigure
     * @param {Object} options
     *
     * Usage:
     *
     *     var options = {
     *        'renderer': 'line',  // Type of chart [line, area, bar, scatterplot]
     *        'stacked' : false,
     *        'axes': [ "bottom", "left", "top"], // Draw axis on border with scale
     *        'chart-padding': [0, 150, 50, 0],   // Graph padding [top, right, bottom, left] in px. Useful to save space for legend
     *      };
     *      $('.chart-container-div').vtkChartConfigure(options);
     */

    $.fn.vtkChartConfigure = function(conf) {
        return this.each(function() {
            var me = $(this),
            data = me.data('chart');
            var opts = $.extend(data['options']['configuration'], conf);
            $('.x_axis_d3', me).height(data.axisThickness + 'px').width(($(window).width()-(2*data.axisThickness)) + 'px');
            data.graph.configure(opts);
            data.graph.update();
        });
    };

    // =======================================================================

    $.fn.vtkChart.defaults = {
        width: 300,
        height: 200,
        axisThickness: 25,
        autosize: true,
        stacked: false,
        renderer: "line",
        interpolation: "linear",
        series: [],
        hover: { xFormatter: function(x) { return x; }, yFormatter: function(y) {return y;} },
        legend: { basic: true, toggle: true, highlight: true },
        annotations: [], // { time: 0, message: "Just a text" } ...
        axes: [ "bottom", "left" ],
        'chart-padding': [0, 0, 0, 0]
    };

    // =======================================================================

}(jQuery));
/**
 * VTK-Web Widget Library.
 *
 * This module extend jQuery object to add support for graphical components
 * related to File Browsing.
 *
 * @class jQuery.vtk.ui.FileBrowser
 */
(function ($) {

    // =======================================================================
    // ==== Defaults constant values =========================================
    // =======================================================================
    var pathSeparator = '/',
    directives = {
         '.vtk-directory': {
            'directory <-': {
                '@path': function(arg) {
                    return pathToStr(arg.item.path);
                },
                '@class+': function(arg) {
                    return (arg.item.path.length === 1) ? ' active' : '';
                },
                '.vtk-label': 'directory.label',
                'li.vtk-files': {
                    'file <- directory.files': {
                        'div': 'file.label'
                    }
                },
                'li.vtk-groups': {
                    'gfile <- directory.groups': {
                        'div': 'gfile.label',
                        '@files': function(arg) {
                            return arg.item.files.join(":");
                        }
                    }
                },
                'li.vtk-dirs': {
                    'dir <- directory.dirs': {
                        'div': 'dir'
                    }
                },
                'li.vtk-path': {
                    'i <- directory.path': {
                        'div': 'i'
                    }//,
                    // filter : function(a) {
                    //     return a.pos < (a.items.length - 1);
                    // }
                }
            }
        }
    },
    fileBrowserGenerator = null;

    $.fn.fileBrowser = function(options) {
        // Handle data with default values
        var opts = $.extend({},$.fn.fileBrowser.defaults, options);

        // Compile template only once
        if(fileBrowserGenerator === null) {
            template = $(opts.template);
            fileBrowserGenerator = template.compile(directives);
        }

        return this.each(function() {
            var me = $(this).empty().addClass('vtk-filebrowser'),
            container = $('<div/>');
            me.append(container);
            me.data('file-list', opts.data);
            me.data('session', opts.session);
            me.data('cacheFiles', opts.cacheFiles);

            if(opts.data === null) {
                opts.session.call('file.server.directory.list',['.']).then(function(files) {
                    opts.data = [ files ];
                    me.data('file-list', opts.data);

                    // Generate HTML
                    container.render(opts.data, fileBrowserGenerator);

                    // Initialize pipelineBrowser (Visibility + listeners)
                    initializeListener(me);
                });
            } else {
                // Generate HTML
                container.render(opts.data, fileBrowserGenerator);

                // Initialize pipelineBrowser (Visibility + listeners)
                initializeListener(me);
            }
        });
    };

    $.fn.updateFileBrowser = function(activeDirectory) {

        return this.each(function() {
            var me = $(this).empty(),
            data = me.data('file-list'),
            newData = [],
            container = $('<div/>');

            me.append(container);

            // Delete the cached active directory and fetch again
            if(activeDirectory && me.data('session')){
                var dirArray = activeDirectory.split("/").splice(1);
                for(var i in data) {
                    var item = data[i];
                    var itemArray = item.path;
                    if ( !equals(itemArray, dirArray) ) {
                        newData.push(data[i]);
                    }
                }

                var requestPath =  activeDirectory.substring(1);
                if(requestPath.indexOf('/') == -1) {
                    requestPath = '.';
                }
                me.data('session').call('file.server.directory.list', [requestPath])
                    .then(function(newFiles){
                        newData.push(newFiles);
                        me.data('file-list', newData);
                        // Generate HTML
                        container.render(newData, fileBrowserGenerator);

                        // Initialize pipelineBrowser (Visibility + listeners)
                        initializeListener(me, activeDirectory);
                    });

            } else {
                // Generate HTML
                container.render(data, fileBrowserGenerator);

                // Initialize pipelineBrowser (Visibility + listeners)
                initializeListener(me, activeDirectory);
            }
        });
    };

    $.fn.fileBrowser.defaults = {
        template: "#vtk-templates > .vtkweb-widget-filebrowser > div",
        session: null,
        data: null,
        cacheFiles: true
    };

    // =======================================================================

    function strToPath(pathId) {
        var path = pathId.split(pathSeparator);
        return path.slice(1, path.length);
    }

    // =======================================================================

    function getParent(path) {
        return path.slice(0, path.length - 2);
    }

    // =======================================================================

    function getPath(parentPath, child) {
        return [].concat(parentPath).concat(child);
    }

    // =======================================================================

    function pathToStr(path) {
        //console.log(path);
        var str = pathSeparator + path.join(pathSeparator);
        return str;
    }

    // =======================================================================

    equals = function(array1, array2) {
        if (array1.length != array2.length) {
            return false;
        }

        for (var i in array1) {
            if (array1[i] !== array2[i]) {
                return false;
            }
        }

        return true;
    }

    // =======================================================================

    function getRelativePath(parentPath, fileName) {
        return '.' + pathToStr(getPath(parentPath, fileName).slice(1));
    }

    // =======================================================================

    function initializeListener(container, activePath) {
        $('.action', container).click(function(){
            var me = $(this), item = $('div', me), pathStr = me.closest('.vtk-directory').attr('path'), type = me.closest('ul').attr('data');

            if(type === 'path') {
                // Find out the panel to show
                var newPath = pathToStr(strToPath(pathStr).slice(0, me.index() + 1)),
                selector = '.vtk-directory[path="' + newPath + '"]';
                var newActive = $(selector , container).addClass('active');
                if(newActive.length === 1) {
                     $('.vtk-directory', container).removeClass('active');
                     newActive.addClass('active');
                }
                if (container.data('cacheFiles') === false) {
                    container.updateFileBrowser(newPath);
                }
            } else if(type === 'dir') {
                // Swicth active panel
                var str = '.vtk-directory[path="' + pathStr + pathSeparator + item.html() + '"]';
                var newActive = $(str, container);
                if(newActive.length === 1) {
                    $('.vtk-directory', container).removeClass('active');
                    newActive.addClass('active');
                    container.trigger({
                        type: 'directory-click',
                        path: pathStr,
                        name: me.text(),
                        relativePath: getRelativePath(strToPath(pathStr), me.text())
                    });
                } else {
                    if(container.data('session')) {
                        var relativePath = (pathStr + '/' + me.text());
                        container.data('session').call('file.server.directory.list', [relativePath.substring(1)]).then(function(newFiles){
                            container.data('file-list').push(newFiles);
                            container.updateFileBrowser(relativePath);
                        });

                    }
                    container.trigger({
                        type: 'directory-not-found',
                        path: pathStr,
                        name: me.text(),
                        relativePath: getRelativePath(strToPath(pathStr), me.text())
                    });
                }
            } else if(type === 'files') {
                container.trigger({
                    type: 'file-click',
                    path: pathStr,
                    name: me.text(),
                    relativePathList: [ getRelativePath(strToPath(pathStr), me.text()) ],
                    list: [ me.text() ],
                    relativePath: getRelativePath(strToPath(pathStr), me.text())
                });
            } else if(type === 'groups') {
                var relativePathList = [], fileList = me.attr('files').split(':');
                for(var i in fileList) {
                    relativePathList.push(getRelativePath(strToPath(pathStr), fileList[i]));
                }
                container.trigger({
                    type: 'file-group-click',
                    path: pathStr,
                    name: me.text(),
                    list: fileList,
                    relativePathList: relativePathList,
                    relativePath: getRelativePath(strToPath(pathStr), me.text())
                });
            }
        });
        if(activePath) {
            $('.vtk-directory',container).removeClass('active');
            $('.vtk-directory[path="' + activePath + '"]',container).addClass('active');
        }

    }

}(jQuery));/**
 * VTK-Web Widget Library.
 *
 * This module extend jQuery object to add support for graphical components
 * related to open tree structure.
 *
 * @class jQuery.vtk.ui.Tree
 */
(function ($) {

    // =======================================================================
    // ==== Defaults constant values =========================================
    // =======================================================================
    var directives = {
            'li' : {
                'child <- children': {
                    '@node_id' : 'child.id',
                    '@type' : 'child.type',
                    '@class+' : function(arg) {
                        hasChild = arg.child.item.children ? ' Open' : '';
                        lastChild = (arg.pos == arg.child.items.length - 1) ? ' lastChild' : '';
                        return lastChild + hasChild;
                    },
                    '.label' : 'child.name',
                    '.tail' : function(arg) {
                        if(!arg.child.item.hasOwnProperty('fields')) {
                            return "";
                        }
                        var fields = arg.child.item.fields;
                        var result = [];
                        for(var key in fields) {
                            result.push(fieldHandler(key, fields[key]));
                        }
                        return result.join('');
                    },
                    'div.children' : function(ctxt) {
                        if(ctxt.child.item.hasOwnProperty('children')) {
                            return treeGenerator(ctxt.child.item);
                        }
                        return '';
                    }
                }
            }
    },
    treeGenerator = null,
    fieldHandler = function(key, value) {
        var buffer = [ '<div class="action" type="', key, '" '];
        if (typeof value === "object") {
            for(var innerKey in value) {
                buffer.push(innerKey);
                buffer.push('="')
                buffer.push(value[innerKey]);
                buffer.push('" ');
            }

        } else if (typeof value === "string") {
            buffer.push('data="')
            buffer.push(value);
            buffer.push('"');
        }
        buffer.push('></div>')
        return buffer.join('');
    };

    $.fn.vtkTree = function(options) {
        // Handle data with default values
        var opts = $.extend({},$.fn.vtkTree.defaults, options);

        // Compile template only once
        if(treeGenerator === null) {
            template = $(opts.template);
            treeGenerator = template.compile(directives);
        }

        return this.each(function() {
            var me = $(this).empty().addClass('vtk-tree'),
            container = $('<div/>'),
            data = { children: [opts.data] };
            me.append(container);
            me.data('tree', data);

            // Generate HTML
            container.render(data, treeGenerator);

            // Initialize pipelineBrowser (Visibility + listeners)
            initializeListener(me);
        });
    };

    $.fn.vtkTree.defaults = {
        template: "#vtk-templates > .vtkweb-widget-tree > ul",
        data: {}
    };

    // =======================================================================

    function initializeListener(container, activePath) {
        $('.action', container).click(function(e) {
            var me = $(this),
            node = me.closest('li'),
            id = node.attr('node_id'),
            type = me.attr('type');

            $('.node-line', container).removeClass('selected');
            $('.node-line:eq(0)', node).addClass('selected');

            container.trigger({
                'type': type,
                'node': id,
                'origin': me
            });
        });
        $('.node-line', container).click(function() {
            var me = $(this),
            node = me.closest('li'),
            id = node.attr('node_id');

            $('.node-line', container).removeClass('selected');
            $('.node-line:eq(0)', node).addClass('selected');

            container.trigger({
                'type': 'select',
                'node': id,
                'origin': me
            });
        });
    }

}(jQuery));