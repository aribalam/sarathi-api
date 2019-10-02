import React, { Component } from 'react';
import '../styles/App.scss';
import { Typography, Grid } from '@material-ui/core';

export default class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            contentHeight: 0,
            contentWidth: 0,
            errorMessage: undefined,
        };
        this.updateContentDimensions = this.updateContentDimensions.bind(this);
    }

    componentDidMount() {
        // saving the previous url to local storage and receiving any error messages associated with it
        const {from, message} = this.props.location.state || {from: {pathname: '/' }};
        if (from) {
            const pathname = from.pathname;
            window.localStorage.setItem('redirectUrl', pathname);
        }
        this.setState({errorMessage: message});

        // removing navbar element and moving the main content div to top
        var bar = document.getElementById('navbar');
        if (bar != null)
            bar.remove();
        var rootElement = document.getElementById('root');
        if (rootElement)
            rootElement.style.top = 0;

        this.updateContentDimensions();
        window.addEventListener('resize', this.updateContentDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateContentDimensions);
    }

    updateContentDimensions() {
        this.setState({
            contentHeight: window.innerHeight,
            contentWidth: window.innerWidth,
        });
    }
    
    render() {
        return (
            <div style={{
                height: this.state.contentHeight, 
                display: 'flex',
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                backgroundImage: "url('/images/background.jpg')",
                backgroundPosition: '50% 50%',
            }}>
                {this.state.errorMessage ? <Typography variant='h6' color='error'>{this.state.errorMessage}</Typography> : ''}
                <Grid container 
                direction='column' 
                alignItems='center'
                justify='center'
                style={{ 
                    width: 300, 
                    height: 400,
                    borderRadius: 6,
                    boxShadow: '0px 3px 6px 4px rgba(0, 0, 0, 0.2)',
                    backgroundColor: 'white',
                    }}>
                    <Grid item style={{paddingBottom: 40}}>
                        <Typography variant='h3' align='center'>Sarathi</Typography>
                        <Typography 
                        variant='subtitle1' 
                        color='textSecondary'
                        align='center'>The Charioteer for KGP</Typography> 
                    </Grid>
                    <Grid item style={{paddingTop: 40}}>
                        <a href="https://sarathi-api.herokuapp.com/api/auth/facebook"
                        style={{
                            backgroundColor: '#3B5998',
                            color: 'white',
                            textDecoration: 'none',
                            padding: 10,
                            border: 'none',
                            borderRadius: 4,
                            display: 'inline-block',
                            fontFamily: 'Segoe UI'
                            }}>
                        <i className="fa fa-facebook fa-fw"></i> Login with Facebook
                        </a>
                    </Grid>
                </Grid>
            </div>
        );
    }
}   