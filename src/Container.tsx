import * as React from "react";
import {RefObject} from "react";
import * as ReactDOM from "react-dom";
import imageData from './assets/imageDatas.json'
import ControllerUnit from './ControllerUnit'
import ImgFigure from "./Main";

import '../node_modules/normalize.css/normalize.css';
import './assets/App.scss';

// 利用自执行函数,讲图片名信息转成图片URL路径信息
function getImageUrl(imageDataArr: any) {
    for (let i = 0; i < imageDataArr.length; i++) {
        const singeImageData = imageDataArr[i];
        singeImageData.imageUrl = require('./assets/images/' + singeImageData.fileName);
        imageDataArr[i] = singeImageData;
    }
    return imageDataArr;
}

interface ImageData {
    desc: string
    fileName: string
    title: string
}

const imageDatas: ImageData[] = getImageUrl(imageData);

/*
 * 获取区间内的一个随机值
 */
function getRangeRandom(low: number, high: number) {
    return Math.floor(Math.random() * (high - low) + low);
}

/*
 * 获取 0~30° 之间的一个任意正负值
 */
function get30DegRandom() {
    return ((Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30));
}

interface ImgsArrangeArrItem {
    pos: {
        MozTransform?: string;
        msTransform?: string;
        WebkitTransform?: string;
        transform?: string;
        left?: number | string;
        top?: number | string
    };

    [propName: string]: any

    rotate: string | number;
    isInverse?: boolean;
    isCenter: boolean;

}

interface IState {
    imgsArrangeArr: ImgsArrangeArrItem []
}

interface IConstant {
    centerPos: {
        left: number;
        right?: number;
        top?: number;
    }
    hPosRange: {
        leftSecX: [number, number];
        rightSecX: [number, number];
        y: [number, number];
    }
    vPosRange: {    // 垂直方向的取值范围
        x: [number, number];
        topY: [number, number];
    }
}


export default class Container extends React.Component<any, IState> {

    public state: IState = {
        imgsArrangeArr: [
            {
                isCenter: false,    // 图片是否居中
                isInverse: false,    // 图片正反面
                pos: {
                    left: 0,
                    top: 0
                },
                rotate: 0,    // 旋转角度
            }
        ]
    };

    public stage: RefObject<HTMLElement> = React.createRef();

    public imgFigureRefs: any = imageDatas.map(() => React.createRef());

    private Constant: IConstant = {
        centerPos: {
            left: 0,
            right: 0
        },
        hPosRange: {   // 水平方向的取值范围
            leftSecX: [0, 0],
            rightSecX: [0, 0],
            y: [0, 0]
        },
        vPosRange: {// 垂直方向的取值范围
            topY: [0, 0],
            x: [0, 0]
        }
    };

    constructor(props: any) {
        super(props);
    }

    public rearrange(centerIndex: number) {
        const imgsArrangeArr = this.state.imgsArrangeArr;
        const Constant = this.Constant;
        const centerPos = Constant.centerPos;
        const hPosRange = Constant.hPosRange;
        const vPosRange = Constant.vPosRange;
        const hPosRangeLeftSecX = hPosRange.leftSecX;
        const hPosRangeRightSecX = hPosRange.rightSecX;
        const hPosRangeY = hPosRange.y;
        const vPosRangeTopY = vPosRange.topY;
        const vPosRangeX = vPosRange.x;

        let imgsArrangeTopArr: ImgsArrangeArrItem[];
        const topImgNum = Math.floor(Math.random() * 2);    // 取一个或者不取
        let topImgSpliceIndex: number;

        const imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);

        // 首先居中 centerIndex 的图片, 居中的 centerIndex 的图片不需要旋转
        imgsArrangeCenterArr[0] = {
            isCenter: true,
            pos: centerPos,
            rotate: 0
        };

        // 取出要布局上侧的图片的状态信息
        topImgSpliceIndex = Math.floor(Math.random() * (imgsArrangeArr.length - topImgNum));
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);

        // 布局位于上侧的图片
        imgsArrangeTopArr.forEach((value, index) => {
            imgsArrangeTopArr[index] = {
                isCenter: false,
                pos: {
                    left: getRangeRandom(vPosRangeX[0], vPosRangeX[1]),
                    top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1])

                },
                rotate: get30DegRandom(),
            };
        });

        // 布局左右两侧的图片
        for (let i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {
            let hPosRangeLORX = null;

            // 前半部分布局左边， 右半部分布局右边
            if (i < k) {
                hPosRangeLORX = hPosRangeLeftSecX;
            } else {
                hPosRangeLORX = hPosRangeRightSecX;
            }

            imgsArrangeArr[i] = {
                isCenter: false,
                pos: {
                    left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1]),
                    top: getRangeRandom(hPosRangeY[0], hPosRangeY[1])
                },
                rotate: get30DegRandom()
            };
        }

        if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
            imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
        }

        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

        this.setState({
            imgsArrangeArr
        });
    }

    public inverse = (index: number) => {
        return () => {
            const imgsArrangeArr = [...this.state.imgsArrangeArr];
            imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
            this.setState({
                imgsArrangeArr
            });
        }
    };

// 组件加载以后， 为每张图片计算其位置的范围
    public componentDidMount() {
        // 首先拿到舞台的大小
        const stageDOM = this.stage.current as HTMLElement;
        const stageW = stageDOM.scrollWidth;
        const stageH = stageDOM.scrollHeight;
        const halfStageW = Math.ceil(stageW / 2);
        const halfStageH = Math.ceil(stageH / 2);

        // 拿到一个imageFigure的大小
        const imgFigureDOM = ReactDOM.findDOMNode(this.imgFigureRefs[0].current) as HTMLElement;
        const imgW = imgFigureDOM.scrollWidth;
        const imgH = imgFigureDOM.scrollHeight;
        const halfImgW = Math.ceil(imgW / 2);
        const halfImgH = Math.ceil(imgH / 2);

        // 计算中心图片的位置点
        this.Constant.centerPos = {
            left: halfStageW - halfImgW,
            top: halfStageH - halfImgH
        };

        // 计算左侧，右侧区域图片排布位置的取值范围
        this.Constant.hPosRange.leftSecX[0] = -halfImgW;
        this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
        this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
        this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
        this.Constant.hPosRange.y[0] = -halfImgH;
        this.Constant.hPosRange.y[1] = stageH - halfImgH;

        // 计算上侧区域图片排布位置的取值范围
        this.Constant.vPosRange.topY[0] = -halfImgH;
        this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
        this.Constant.vPosRange.x[0] = halfStageW - imgW;
        this.Constant.vPosRange.x[1] = halfStageW;

        const imgsArrangeArr = this.state.imgsArrangeArr;

        this.rearrange(getRangeRandom(0, imgsArrangeArr.length));

    }

    public render() {
        const controllerUnits: any = [];
        const imgFigures: any = [];

        imageDatas.forEach((value: any, index: number) => {

            if (!this.state.imgsArrangeArr[index]) {
                this.state.imgsArrangeArr[index] = {
                    isCenter: false,
                    isInverse: false,
                    pos: {
                        left: 0,
                        top: 0
                    },
                    rotate: 0
                };
            }

            imgFigures.push(
                <ImgFigure
                    key={index}
                    data={value}
                    ref={this.imgFigureRefs[index]}
                    arrange={this.state.imgsArrangeArr[index]}
                    inverse={this.inverse(index)} center={this.center(index)}
                />
            );
            controllerUnits.push(
                <ControllerUnit
                    key={index}
                    arrange={this.state.imgsArrangeArr[index]}
                    inverse={this.inverse(index)}
                    center={this.center(index)}/>
            );
        });

        return (
            <section className="stage" ref={this.stage}>
                <section className="img-sec">
                    {imgFigures}
                </section>
                <nav className="controller-nav">
                    {controllerUnits}
                </nav>
            </section>

        );
    }

    /*
    * 利用arrange函数， 居中对应index的图片
    * @param index, 需要被居中的图片对应的图片信息数组的index值
    * @returns {Function}
    */
    public center = (index: number) => {
        return () => {
            this.rearrange(index)
        }
    }
}