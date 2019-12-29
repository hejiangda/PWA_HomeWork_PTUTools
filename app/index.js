if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("serviceworker.js")
        .then(function (registration) {
            console.log("Service Worker registered with scope:", registration.scope);
        }).catch(function (err) {
            console.log("Service worker registration failed:", err);
        });
}
let inputElement = document.getElementById('fileInput');
let srcMat, dstMat, showMat;
let srcImg = new Image();
let cmpFlg = false;
// 保存编辑历史的栈（最多10次记录）
let imgStack = [];
let redoStack = [];
let fileName;
// 图片加载
inputElement.addEventListener('change', (e) => {
    let file = e.target.files[0], // 获取文件
        imageType = /^image\//;
    // 文件是否为图片
    if (!imageType.test(file.type)) {
        alert("请选择图片！");
        return;
    }
    // console.log(file);
    fileName = 'new_' + file.name;
    srcImg.src = URL.createObjectURL(e.target.files[0]);
    flipPage();

}, false);
// 初始化图片
srcImg.onload = function () {
    srcMat = cv.imread(srcImg);
    dstMat = srcMat.clone();
    showMat = new cv.Mat();
    showResult();
};
// 撤销栈
function pushImgStack() {
    let tmp = dstMat.clone();
    imgStack.push(tmp);
    if (imgStack.length > 10)
        imgStack.shift();
};
// 重做栈
function pushRedoStack() {
    let tmp = dstMat.clone();
    redoStack.push(tmp);
    if (redoStack.length > 10)
        redoStack.shift();
}
// 窗口大小改变后适应窗口大小
window.onresize = showResult;
// 显示结果
function showResult() {
    cmpFlg = false;

    cv.imshow('canvasHidden', dstMat);
    let canvasDivWidth = document.body.clientWidth;
    if (dstMat.cols > canvasDivWidth) {
        let dsize = new cv.Size(canvasDivWidth, canvasDivWidth * dstMat.rows / dstMat.cols);
        cv.resize(dstMat, showMat, dsize, 0, 0, cv.INTER_AREA);
        cv.imshow('canvasOutput', showMat);
    } else {
        cv.imshow('canvasOutput', dstMat);
    }
}
// 显示原图
function showCmp() {
    cmpFlg = true;
    if (srcMat.cols > document.body.clientWidth) {
        let dsize = new cv.Size(document.body.clientWidth, document.body.clientWidth * srcMat.rows / srcMat.cols);
        cv.resize(srcMat, showMat, dsize, 0, 0, cv.INTER_AREA);
        cv.imshow('canvasOutput', showMat);
    }
    else {
        cv.imshow('canvasOutput', srcMat);
    }
    hiddenCircle();

}
// 灰度
function gray() {
    setTimeout(function () {
        pushImgStack();
        cv.cvtColor(dstMat, dstMat, cv.COLOR_RGBA2GRAY, 0);
        showResult();
        hiddenCircle();
    }, 100);
}
// 浮雕
function felief() {
    setTimeout(function () {
        pushImgStack();
        let anchor = new cv.Point(0, 0);
        let m = cv.matFromArray(3, 3, cv.CV_32FC1, [1, 0, 0, 0, 0, 0, 0, 0, -1]);
        cv.filter2D(dstMat, dstMat, cv.CV_8U, m, anchor, 0, cv.BORDER_DEFAULT);
        let mat = new cv.Mat(dstMat.rows, dstMat.cols, dstMat.type(), new cv.Scalar(128, 128, 128, 255));
        let mask = new cv.Mat();
        cv.add(dstMat, mat, dstMat, mask, -1);
        showResult();
        hiddenCircle();
    }, 100);
}
// 雕刻
function carve() {
    setTimeout(function () {
        pushImgStack();
        let anchor = new cv.Point(0, 0);
        let m = cv.matFromArray(3, 3, cv.CV_32FC1, [-1, 0, 0, 0, 0, 0, 0, 0, 1]);
        cv.filter2D(dstMat, dstMat, cv.CV_8U, m, anchor, 0, cv.BORDER_DEFAULT);
        let mat = new cv.Mat(dstMat.rows, dstMat.cols, dstMat.type(), new cv.Scalar(128, 128, 128, 255));
        let mask = new cv.Mat();
        cv.add(dstMat, mat, dstMat, mask, -1);
        showResult();
        hiddenCircle();
    }, 100);
}

waitCircle();
// showCircle();
// 显示等待圆
function showCircle() {
    waitCircle();
    document.getElementById("container").style.display = "flex";
    let btn = document.getElementsByClassName('btn-primary');
    for (let i = 0; i < btn.length; i++) {
        btn[i].disabled = true;
    }
}
// 隐藏等待圆
function hiddenCircle() {
    document.getElementById("container").style.display = "none";

    let btn = document.getElementsByClassName('btn-primary');
    for (let i = 0; i < btn.length; i++) {
        btn[i].disabled = false;
    }
}
// 等待圆初始化
function waitCircle() {
    document.getElementById("container").style.top = (document.documentElement.scrollTop + (document.documentElement.clientHeight - document.getElementById("container").offsetHeight) / 2 - 40) + "px";
    document.getElementById("container").style.left = (document.documentElement.scrollLeft + (document.documentElement.clientWidth - document.getElementById("container").offsetWidth) / 2 - 40) + "px";
}
// 怀旧
function oldDays() {
    setTimeout(function () {
        pushImgStack();
        // waitCircle();
        for (let i = 0; i < dstMat.rows; i++) {
            for (let j = 0; j < dstMat.cols; j++) {
                let pixel = dstMat.ucharPtr(i, j);
                let r = pixel[0];
                let g = pixel[1];
                let b = pixel[2];
                let rr = r * 0.393 + g * 0.769 + b * 0.189 > 255 ? 255 : r * 0.393 + g * 0.769 + b * 0.189;
                let gg = r * 0.349 + g * 0.686 + b * 0.168 > 255 ? 255 : r * 0.349 + g * 0.686 + b * 0.168;
                let bb = r * 0.272 + g * 0.534 + b * 0.131 > 255 ? 255 : r * 0.272 + g * 0.534 + b * 0.131;
                dstMat.ucharPtr(i, j)[0] = rr;
                dstMat.ucharPtr(i, j)[1] = gg;
                dstMat.ucharPtr(i, j)[2] = bb;
                // dstMat.data.set([rr, gg, bb, 255], i * dstMat.cols * dstMat.channels() + j * dstMat.channels());
            }
        }
        showResult();
        hiddenCircle();
    }, 100);
}

// 毛玻璃
function groundGlass() {
    setTimeout(function () {
        pushImgStack();
        let tmpMat = dstMat.clone();
        for (let i = 1; i < dstMat.rows - 1; i++) {
            for (let j = 1; j < dstMat.cols - 1; j++) {
                let tmp1 = Math.floor(Math.random() * 3) - 1;
                let tmp2 = Math.floor(Math.random() * 3) - 1;

                let r = tmpMat.ucharAt(i + tmp1, (j + tmp2) * dstMat.channels());
                let g = tmpMat.ucharAt(i + tmp1, (j + tmp2) * dstMat.channels() + 1);
                let b = tmpMat.ucharAt(i + tmp1, (j + tmp2) * dstMat.channels() + 2);

                dstMat.data.set([r, g, b, 255], i * dstMat.cols * dstMat.channels() + j * dstMat.channels());
            }
        }
        tmpMat.delete();
        showResult();
        hiddenCircle();
    }, 100);
}
// 高斯模糊
function gaussianBlur() {
    setTimeout(function () {
        pushImgStack();
        let ksize = new cv.Size(7, 7);
        // You can try more different parameters
        cv.GaussianBlur(dstMat, dstMat, ksize, 0, 0, cv.BORDER_DEFAULT);
        showResult();
        hiddenCircle();
    }, 100);
}
// 加载OpenCV.js 的提示
function onOpenCvReady() {
    document.getElementById('waitOpencv').style.display = "none";
    document.getElementById('inputBox').style.display = "initial"
    // hiddenCircle();
}
// 切换页面
function flipPage() {
    let mainPage = document.getElementById('main')
    mainPage.style.display = "none";

    let processingPage = document.getElementById('processing');
    processingPage.style.display = "initial";
}
// 返回
let gobackBtn = document.getElementById('goback');
gobackBtn.addEventListener('click', (e) => {
    location.reload();
});
// 对比
let compareBtn = document.getElementById('compare');
compareBtn.addEventListener('click', (e) => {
    setTimeout(function () {
        cmpFlg ? showResult() : showCmp();
        hiddenCircle();
    }, 100);
});
compareBtn.addEventListener('click', (e) => {
    showCircle();
})
// 重置
let resetBtn = document.getElementById('reset');
resetBtn.addEventListener('click', (e) => {
    setTimeout(function () {
        dstMat = srcMat.clone();
        showResult();
        imgStack = [];
        redoStack = [];
        cmpFlg = false;
        hiddenCircle();
    }, 100);
});
resetBtn.addEventListener('click', (e) => {
    showCircle();
});
// 撤销
let withdrawBtn = document.getElementById('withdraw');
withdrawBtn.addEventListener('click', (e) => {
    setTimeout(function () {
        pushRedoStack();
        if (imgStack.length > 0)
            dstMat = imgStack.pop();
        showResult();
        hiddenCircle();
    }, 100);
});
withdrawBtn.addEventListener('click', (e) => {
    showCircle();
});
// 重做
let redoBtn = document.getElementById('redo');
redoBtn.addEventListener('click', (e) => {
    setTimeout(function () {
        pushImgStack();
        if (redoStack.length > 0)
            dstMat = redoStack.pop();
        showResult();
        hiddenCircle();
    }, 100);
});
redoBtn.addEventListener('click', (e) => {
    showCircle();
});
// 保存
let saveBtn = document.getElementById('save');
saveBtn.addEventListener('click', (e) => {
    let canvas = document.getElementById('canvasHidden');
    canvas.toBlob(function (blob) {
        let link = document.createElement('a');
        link.download = fileName;
        link.href = URL.createObjectURL(blob);
        link.click();
    }, "image/png", 0.9);
});
