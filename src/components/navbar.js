import * as React from 'react';
import { AppBar, Box, Toolbar, Typography, Button } from "@mui/material";
import {MenuItem, Menu} from '@mui/material';

import { Link, useNavigate } from "react-router-dom";

import {AuthContext } from '../context/authContext'
import { useContext } from "react";

function NavBar() {
    let navigate = useNavigate();
    const { user, logout} = useContext(AuthContext);

    const onLogout = () => {
        logout();
        navigate('/');
    }

    /******* */
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

console.log({user})
    return (
        <Box sx={{ flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h5" component="div">
                        <Link to="/" style={{textDecoration: "none", color:"white"}}>Y-APP </Link>
                    </Typography>
                    <Box alignItems="right" sx={{flexGrow: 1, textAlign: "Left", marginLeft: "10px"}}>
                    { 
                    user ? 
                    <>
                    <div>
                        <Button
                            style={{textDecoration: "none", color:"white"}}
                            id="basic-button"
                            aria-controls={open ? 'basic-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClick}
                        >
                            Menu
                        </Button>
                        <Menu
                            id="basic-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            MenuListProps={{
                            'aria-labelledby': 'basic-button',
                            }}
                        >
                            <MenuItem onClick={handleClose}><Link to="/Product" style={{textDecoration: "none"}}> Productos </Link></MenuItem>
                            <MenuItem onClick={handleClose}><Link to="/TypeProduct" style={{textDecoration: "none"}}> Tipo de Productos </Link></MenuItem>
                            <MenuItem onClick={handleClose}><Link to="/PointSale" style={{textDecoration: "none"}}> Punto de Venta </Link></MenuItem>
                        
                        </Menu>
                        
                    </div>
                    </>
                    :<><div></div></>
                    }
                        {/* <Link to="/User" style={{textDecoration: "none", color:"white"}}> Usuarios </Link> */}
                        {/* <Link to="/Product" style={{textDecoration: "none", color:"white"}}> Productos </Link>
                        <Link to="/TypeProduct" style={{textDecoration: "none", color:"white"}}> Tipo de Productos </Link> */}
                    </Box>
                    <Box alignItems="right" sx={{flexGrow: 1, textAlign: "right"}}>
                        {
                            user ? 
                            <>
                            <Button style={{textDecoration: "none", color:"white"}} onClick={onLogout}>Salir</Button>
                            </>
                            :
                            <>
                                <Link to="/login" style={{textDecoration: "none", color:"white", marginRight: "10px"}}>Login </Link>
                                <Link to="/register" style={{textDecoration: "none", color:"white", marginRight: "10px"}}>Registro </Link>
                            </>
                        }
                        
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default NavBar;
