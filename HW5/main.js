$(document).ready(function(){
    //do something
    $("#thisButton").click(function(){
        processImage();
    });
    $("#inputImageFile").change(function(e){
        processImageFile(e.target.files[0]);
    });
});

function processImage() {
    
    //確認區域與所選擇的相同或使用客製化端點網址
    var url = "https://eastus.api.cognitive.microsoft.com/";
    var uriBase = url + "vision/v2.1/analyze";
    
    var params = {
        "visualFeatures": "ImageType,Faces,Adult,Brands,Categories,Description",
        //"details": "",
        "maxCandidates":"10",
        "language": "zh",
    };
    //顯示分析的圖片
    var sourceImageUrl = document.getElementById("inputImage").value;
    document.querySelector("#sourceImage").src = sourceImageUrl;
    //送出分析
    $.ajax({
        url: uriBase + "?" + $.param(params),
        // Request header
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },
        type: "POST",
        // Request body
        data: '{"url": ' + '"' + sourceImageUrl + '"}',
    })
    .done(function(data) {
        //顯示JSON內容
        $("#responseTextArea").val(JSON.stringify(data, null, 2));
        $("#picDescription").empty();
        for (var x = 0; x < data.description.captions.length; x++) {
            $("#picDescription").append(data.description.captions[x].text + "<br>");
        }
        //$("#picDescription").append("這裡有"+data.faces.length+"個人");
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        //丟出錯誤訊息
        var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;
        alert(errorString);
    });
};

//檔案版
function processImageFile(imageObject) {
    
    //確認區域與所選擇的相同或使用客製化端點網址
    var url = "https://eastus.api.cognitive.microsoft.com/";
    var uriBase = url + "vision/v2.1/analyze";
    
    var params = {
        "visualFeatures": "ImageType,Faces,Adult,Brands,Categories,Description,Color,Objects",
        //"details": "",
        "maxCandidates":"10",
        "language": "zh",
    };
    //顯示分析的圖片
    var sourceImageUrl =URL.createObjectURL(imageObject);
    document.querySelector("#sourceImage").src = sourceImageUrl;
    //送出分析
    $.ajax({
        url: uriBase + "?" + $.param(params),
        // Request header
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Content-Type","application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },
        type: "POST",
        processData:false,
        contentType:false,
        // Request body
        data:imageObject
    })
    .done(function(data) {
        //顯示JSON內容
        $("#responseTextArea").val(JSON.stringify(data, null, 2));
        $("#picDescription").empty();
        //for (var x = 0; x < data.description.tags.length; x++) {
       //     $("#picDescription").append(data.description.tags[x] + "<br>");
        //}
       
        //var colors = data.color;
        //if (colors) {
        //    for (var i = 0; i < colors.dominantColors.length; i++) {
        //        $("#picDescription").append(colors.dominantColors[i] + "<br>");
        //    }
        //}
        
        //var imageType = data.imageType;
        //if (imageType) {
        //    $("#picDescription").append("圖像類型: " + imageType.clipArtType + "<br>");
        //    $("#picDescription").append("線描圖類型: " + imageType.lineDrawingType + "<br>");
        //}
        var imageType = data.imageType;
        if (imageType) {
            $("#picDescription").append("圖像類型: " + imageType.clipArtType + "<br>");
            $("#picDescription").append("線描圖類型: " + imageType.lineDrawingType + "<br>");

            // 添加对应的文字描述
            var clipartTypeText;
            switch (imageType.clipArtType) {
                case 0:
                    clipartTypeText = "Non-clipart";
                    break;
                case 1:
                    clipartTypeText = "ambiguous Clipart";
                    break;
                case 2:
                    clipartTypeText = "normal-clipart";
                    break;
                case 3:
                    clipartTypeText = "good-clipart";
                    break;
                default:
                    clipartTypeText = "uncertain";
                    break;
            }
            $("#picDescription").append("Clipart類型: " + clipartTypeText + "<br>");

            var lineDrawingTypeText;
            switch (imageType.lineDrawingType) {
                case 0:
                    lineDrawingTypeText = "Non-LineDrawing";
                    break;
                case 1:
                    lineDrawingTypeText = "LineDrawing";
                    break;
                default:
                    lineDrawingTypeText = "uncertain";
                    break;
            }
            $("#picDescription").append("線描圖類型: " + lineDrawingTypeText + "<br>");
        }
       // $("#picDescription").append("這裡有"+data.faces.length+"個人");
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        //丟出錯誤訊息
        var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;
        alert(errorString);
    });
};
