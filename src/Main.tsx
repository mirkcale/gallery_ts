import * as React from 'react';


interface IProps {
    arrange: {
        pos: any,
        isCenter: boolean,
        [propity: string]: any
    }
    data: {
        imageUrl: string
        title: string
        desc: string
    }
    inverse: any,
    center: any
}

export default class ImgFigure extends React.Component<IProps, any> {
    constructor(props: any) {
        super(props);
    }

    public handleClick = (e: any)=> {
        if (this.props.arrange.isCenter) {
            this.props.inverse();
        } else {
            this.props.center();
        }
        e.stopPropagation();
        e.preventDefault();
    };

    public render() {

        let styleObj: any = {};

        // 如果props属性中指定了这张图片的位置，则使用
        if (this.props.arrange.pos) {
            styleObj = {...this.props.arrange.pos};
        }

        // 如果图片的旋转角度有值并且不为0， 添加旋转角度
        if (this.props.arrange.rotate) {
            styleObj.transform = 'rotate(' + this.props.arrange.rotate + 'deg)';
        }
        // 如果是居中的图片， z-index设为11
        if (this.props.arrange.isCenter) {
            styleObj.zIndex = 11;
        }
        let imgFigureClassName = 'img-figure';
        imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';

        return (
            <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
                <img src={this.props.data.imageUrl}
                     alt={this.props.data.title}/>
                <figcaption>
                    <h2 className="img-title">{this.props.data.title}</h2>
                    <div className="img-back" onClick={this.handleClick}>
                        <p>
                            {this.props.data.desc}
                        </p>
                    </div>
                </figcaption>
            </figure>
        );
    }
}




