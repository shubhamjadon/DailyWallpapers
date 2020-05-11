import React, { Component } from 'react';
import './App.css';
import api from './config/api';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

export default class App extends Component {
    constructor(props) {
		super(props);
		this.state = {
            images: [],
            pageNo: 1,
            display: "none",
            blur: false,
            cond: true,
            search: false,
            inputValue: "",
            tempInputValue: "",
            searchDisplay: false,
            isSearchEmpty: false
        };
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll, true);
        api.getList(this.state.pageNo, (images) => {
            this.setState({images: images, pageNo: this.state.pageNo + 1});
        });
        ipcRenderer.on('reply', (event, arg) => {
            this.setState({blur: false});
        })

        document.addEventListener("keydown", this.searchCheck);
    }

    reset = () => {
        this.setState({isSearchEmpty: false, images: [], pageNo: 1, search: false, tempInputValue: ""});
        api.getList(this.state.pageNo, (images) => {
            this.setState({images: images, pageNo: this.state.pageNo + 1});
        });
    }

    handleScroll = () => { 

        if(document.body.scrollHeight - 640 < window.scrollY && this.state.cond){
            this.setState({display: "inline-block", cond: false})
                api.getList(this.state.pageNo, (images,cond) => {
                this.setState({images: [...this.state.images, ...images], pageNo: this.state.pageNo+1, display: "none", cond: cond});
            },this.state.search,this.state.tempInputValue)
        }
    }
    
    setWallpaper(imgLink){
        this.setState({blur: true});
        let link = imgLink.split("/");
        let image = `https://images.wallpaperscraft.com/image/${link[2]}_1920x1080.jpg`;
        ipcRenderer.send('toggle-image', image);
    }

    inputValueChange = (event) => {
        this.setState({inputValue: event.target.value});
    }

    keyPress = (e) => {

        if(e.keyCode == 13){
            window.scrollTo(0,0);
            this.setState({search: true, searchDisplay: false, pageNo:2, tempInputValue: this.state.inputValue ,inputValue:""});
            api.search(this.state.inputValue, (images, isSearchEmpty) => {
                if(isSearchEmpty)
                    this.setState({isSearchEmpty: isSearchEmpty});
                else
                    this.setState({images: images})
            })
        }
    }

    searchCheck = (e) => {
        if(e.keyCode == 27)
            this.setState({searchDisplay: false, inputValue:""});
        let charCode = String.fromCharCode(e.which).toLowerCase();
        
        if(e.ctrlKey && charCode === 's' && !this.state.isSearchEmpty)
            this.setState({searchDisplay: true});
    
    }

    render() {
        return (
            <div className="App">
                <div className="general" style={{display: (this.state.isSearchEmpty) ? "none" : "inline-block"}}>
                    <div className="content" style={{opacity: (this.state.blur) ? 0: 1 , filter: (this.state.searchDisplay) ? 'blur(8px)' : 'blur(0px)'}}>
                        <div className="lds-ellipsis" style={{display: (this.state.images.length) ? 'none': 'inline-block'}}><div></div><div></div><div></div><div></div></div>
                        {this.state.images.map(image => 
                            <img src={image[0]} alt="Wallpaper Images" onClick={ () => { this.setWallpaper(image[1]) } } ></img>
                        )}
                        <div className="lds-ellipsis" style={{display: this.state.display}}><div></div><div></div><div></div><div></div></div>
                    </div>
                    <div className="parent" style={{opacity: (this.state.blur) ? 1: 0 }}><div class="lds-ripple"><div></div><div></div></div></div>
                    <div class="input-group input-group-lg container">
                        <input type="text" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-lg" placeholder="Type and Press Enter" value={this.state.inputValue} style={{display: (this.state.searchDisplay) ? 'inline-block': 'none'}} onKeyDown={this.keyPress} onChange={this.inputValueChange} />
                    </div>
                </div>
                <div className="special" style={{display: (this.state.isSearchEmpty) ? "block" : "none"}}>
                    <div className="image">
                        <img src="empty_state.png" width="250px" height="250px" alt="Nothing found"></img>
                    </div>
                    <h3>No result found!</h3>
                    <button className="btn btn-primary" onClick={ () => {this.reset()}}>Go Home</button>
                </div>
            </div>
        );
    }
}