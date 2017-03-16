'use strict'

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
//import fabric, {Canvas, Text, Image} from 'react-fabricjs';
import {fabric} from 'fabric-webpack'
import $ from 'jquery'
import {previewImage} from '../actions'
import { SketchPicker } from 'react-color';


import { SwatchesPicker } from 'react-color'
import SizeSlider from '../containers/slider'

var width = $(window).width();
var height = $(window).height();
var cHex;
var showPicker = false;
var freeText = "Enter Freehand Draw";
var stateTest;
var colorMode;

function saveRenderedCanvas(dataURI){
    var server = 'http://localhost:3030';
    
    $.ajax(
        {
            url : server+"/api/projects",
            type : "GET",
            xhrFields: {
                   withCredentials: true
            },
            crossDomain: true,
            success : function(data) {
                if (data.success === true){
                    var project = data.projects[0];
                    var renderedImageEndPoint = server+"/api/projects/"+project+"/renderedImages";                      
                    $.ajax(
                           {
                            
                                url: renderedImageEndPoint,
                                type:"POST",
                                xhrFields: {
                                    withCredentials: true
                                },
                                data :{
                                    image:dataURI
                                },
                                crossDomain: true,
                                
                                success: function(data){
                                    if (data.success == true){
                                        alert("Your Image has been Saved");
                                    }else{
                                        alert(data.message);
                                    }
                                }
                        })
                        .fail(
                            function() { alert("ajax failure");}
                        );
                        
                    
                }
            }
        })
        .fail(
            function() { alert("ajax failure");}
        );           
}

function canvasToImage(ctx,canvas,size){
    var w = canvas.width,
    h = canvas.height,
    pix = {x:[], y:[]},
    imageData = ctx.getImageData(0,0,canvas.width,canvas.height),
    x, y, index;

    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            index = (y * w + x) * 4;
            if (imageData.data[index+3] > 0) {

                pix.x.push(x);
                pix.y.push(y);

            }   
        }
    }
    pix.x.sort(function(a,b){return a-b});
    pix.y.sort(function(a,b){return a-b});
    var n = pix.x.length-1;

    w = pix.x[n] - pix.x[0];
    h = pix.y[n] - pix.y[0];
    var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);
    
    //Posts cropped image to new canvas and creates htmlimagesrc
    var canvas1= document.createElement('canvas');
    var ctx1=canvas1.getContext('2d');    
    canvas1.width = w;
    canvas1.height = h;
    ctx1.putImageData(cut, 0, 0);   
    var imgURL = canvas1.toDataURL();
    var tmpImage = document.createElement("IMG");    
    tmpImage.src = imgURL;
    //Creates new canvas and draw cropped image of specific size
    var canvas2 = document.createElement('canvas');
    var ctx2 = canvas2.getContext('2d');
    canvas2.width = size;
    canvas2.height = size;
    ctx2.drawImage(tmpImage,0,0,size,size);
    var final = canvas2.toDataURL();
    
    console.log(final)
   
    return final;
    
}
     

class FabricCanvas extends Component {
	constructor(props){
		super(props);
        this.state = {
            canvas : null,
            text: "Freehand On",
        };
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
		this.propsToImages = this.propsToImages.bind(this);
        this.buttonClick = this.buttonClick.bind(this);
        this.saveButton = this.saveButton.bind(this);
        this.drawImage = this.drawImage.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.moveObjectForward = this.moveObjectForward.bind(this);
        this.moveObjectBackward = this.moveObjectBackward.bind(this);
        this.deleteActiveObject = this.deleteActiveObject.bind(this);
        this.addText = this.addText.bind(this);
        this.selectColor = this.selectColor.bind(this);
        this.setHalo = this.setHalo.bind(this);
        this.enterDrawingMode = this.enterDrawingMode.bind(this);
        this.choose = this.choose.bind(this);
        this.chooseColor = this.chooseColor.bind(this);
        this.testState = this.testState.bind(this);
	}
    //Global Canvas variable
    
    
    

    //Added so canvas would not rerender on props change
    
    shouldComponentUpdate(nextProps, nextState){
        console.log("Something Changed");
        if (nextProps.images != null && this.state.canvas !=null){
            if (this.props.size == nextProps.size){
                this.drawImage(nextProps.images); 
            }
        }
        return false;
    }   
    
    componentDidMount(){
        var canvas = new fabric.Canvas('c', {
        isDrawingMode: false,
        });
        this.setState({canvas});           
    }       
	propsToImages(){
		if (this.props.images == []){
			console.log("images was empty\n");
		}
		else{
			return this.props.images.map((image) => 
				<Image
			        src={image['url']}
			        crossOrigin='use-credentials'
			        width={image['width']}
			        height={image['height']}
			        left={image['left']}
			        top={image['top']} 
			    />
		    )
		}
	}
    
    buttonClick(){ 
        console.log(this);
        var canvas = document.getElementById("c"); 
        var activeCanvas = this.state.canvas; 
        activeCanvas.discardActiveObject();
        activeCanvas.deactivateAll().renderAll();
        var ctx = canvas.getContext('2d');
        var data = canvasToImage(ctx,canvas,this.props.maxSize);
        this.props.previewClicked(data);
    }
    
    saveButton(){        
        var canvas = document.getElementById("c"); 
        var activeCanvas = this.state.canvas; 
        activeCanvas.discardActiveObject();       
        var ctx = canvas.getContext('2d');
        var data = canvasToImage(ctx,canvas,this.props.maxSize);
        saveRenderedCanvas(data);
    }
    
    drawImage(image){
        var canvas = this.state.canvas;

        fabric.Image.fromURL(image, function(oImg){
           canvas.add(oImg);
        });        
    } 
    
    moveObjectForward(){
        var canvas = this.state.canvas;
        var object = canvas.getActiveObject();
        if (object!= null){
            canvas.bringForward(object);
        }
    }
    
    moveObjectBackward(){
        var canvas = this.state.canvas;
        var object = canvas.getActiveObject();
        if (object != null){
            canvas.sendBackwards(object);
        }
    }

    deleteActiveObject(){
        console.log("Delete Key Pressed");
        var canvas = this.state.canvas;
        var object = canvas.getActiveObject();
        if (object!=null){
            object.remove();
        }
    }

    addText(){
        var canvas = this.state.canvas;
        canvas.add(new fabric.IText('Tap and type text here', { 
          fontFamily: 'arial black',
          fontSize: 20,
          left: 100, 
          top: 100 ,
        }));
    }

    selectColor(){
        colorMode = "interior";
    }

    setHalo(){
        colorMode = "halo";
    }

    chooseColor(c){
        var canvas = this.state.canvas;
        var object = canvas.getActiveObject();
        var filter = new fabric.Image.filters.Tint({
            color: c.hex,
            opacity: 1.0
        });
        var whiteFilter = new fabric.Image.filters.RemoveWhite({
              threshold: 40,
              distance: 140
        });
        if(colorMode == "interior"){
            if(object != null && object.get('type') == 'i-text'){
                object.setFill(c.hex);
                canvas.renderAll();
            }
            else if (object!= null){
                object.setFill(c.hex);
                object.filters.push(whiteFilter);
                object.filters.push(filter);
                object.applyFilters(canvas.renderAll.bind(canvas));
                canvas.renderAll();
            }

        }else if(colorMode == "halo"){
            if (object != null){
            object.setShadow({color: c.hex, blur: 100 });
            canvas.renderAll();
            }
        }
    }

    enterDrawingMode(){
        var canvas = this.state.canvas;
        canvas.isDrawingMode = !canvas.isDrawingMode;
        
        if(this.state.text == "Freehand Off"){
            this.setState({text : "Freehand On"});
        }
        else{
            this.setState({text : "Freehand Off"});
        }
        this.forceUpdate();
        canvas.renderAll();
    }

    testState(){
        console.log(this.props);
        var canvas = this.state.canvas;
        canvas.clear();
        this.setState(stateTest);
        canvas.renderAll();
    }
    
    
    choose () {
         showPicker = true;
    }

    render() {
        
        return (
            <div>
                
                <div className = "image-list" style = {{height: 300, width: 150, float: 'left', borderWidth: 1, borderStyle: 'solid', borderColor: '#13496e', marginLeft: 0.45}}>
                    Todo: Image Layer List
                </div>
                <div className = "canvas" style = {{height: 300, width: 300, float: 'left', borderWidth: 1, borderStyle: 'solid', borderColor: '#13496e'}}>
                    <canvas id = "c" width={300} height={300}></canvas>   
                </div>
                <div style = {{height: 300, width: 221, float: 'left', borderStyle: 'solid', borderWidth: 1, borderColor: '#13496e', marginLeft: 0}}><SketchPicker color={ 'black' } onChange={ this.chooseColor }/></div>
                <div className = "buttons" style = {{height: 30, width: 750, float:'none'}}>
                    <button onClick = {this.saveButton}>Save Image</button>
                    <button onClick = {this.buttonClick}>Preview</button> 
                    <button onClick = {this.moveObjectForward}>Bring Forward</button>
                    <button onClick = {this.moveObjectBackward}>Bring Backward</button>
                    <button onClick = {this.deleteActiveObject}>Delete Object</button>
                    <button onClick = {this.addText}>Add Text</button>
                    <button onClick = {this.selectColor}>Color Fill</button>
                    <button onClick = {this.setHalo}>Set Halo</button>
                    <button onClick = {this.enterDrawingMode}>{this.state.text}</button>
                </div>  
            </div>          
        );
    }
}

FabricCanvas.propTypes = {

	images: PropTypes.string,
    previewClicked: PropTypes.func.isRequired,
    size: PropTypes.number,
    maxSize: PropTypes.number
}

FabricCanvas.defaultProps = {

	images: [],
    previewClicked: (dataURL) => console.log("Clicked on preview"),
    maxSize: 100

}

function mapDispatchToProps(dispatch) {
    return ({
        previewClicked: (dataURL) => {dispatch(previewImage(dataURL))}
    })
}


const mapStateToProps = (state) => {
	return {
		images:state.library.src,
        size: state.slider.value,
		color: state.color.color,
	}
}

const FabricContainer = connect(mapStateToProps, mapDispatchToProps)(FabricCanvas); 

export default FabricContainer;