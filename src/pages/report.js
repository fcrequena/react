import {AuthContext } from '../context/authContext'
import { useContext, useState } from "react";
import { Alert, Autocomplete, Box, Button, Container, Grid, IconButton, Modal, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material"
import * as React from 'react';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import {makeStyles} from "@mui/styles";
import { styleModal, Item } from '../components/modal';
import { useMutation } from '@apollo/react-hooks';
import { REPORT_MONTH, GET_POINT_SALE_USER } from '../gql/mutation';
import MyTitle from '../components/title';
import { Delete, Edit } from '@mui/icons-material';
import SpanningTable from '../components/tableDiary';
import { useNavigate } from 'react-router-dom';

import SimpleSnackbar from '../components/snackbars';

const theme = createTheme();
const useStyles = makeStyles((theme) => (styleModal));

function Report(){

    let navigate = useNavigate();
    const context = useContext(AuthContext);
    const classes = useStyles();
    const [ errors, setErrors ] = useState([]);
    const [ pointSaleData, setPointSaleData ] = useState([]);
    const [ reportData, setReportData ] = useState([]);
    const [ productSeleccionado, setProductoSeleccionado ] = useState({
        punto_venta: 0,
        fecha_inicio: '',
        fecha_fin: ''
    });
    const [ isLoggeIn, setIsLoggeIn ] = useState(true);
    const [ mostrarSnackBar, setMostrarSnackBar ] = useState({
        mensaje: " -- inicio ===",
        esError: false,
        mostrar: false
    });
    const { user, logout} = useContext(AuthContext);
     
    const handleChange = e => {
        const {name, value } = e.target;
        setProductoSeleccionado(prevState => ({
            ...prevState,
            [name]: value
        }))
    };

    /*****MUTATION */
    const [ getReport, { getReportLoading }] = useMutation(REPORT_MONTH,{
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        variables: { 
            codigo_punto_venta: productSeleccionado.punto_venta,
            fecha_inicio:  productSeleccionado.fecha_inicio,
            fecha_fin: productSeleccionado.fecha_fin
        },
        onCompleted: (data) => {
            console.log({llamada: data.getReportJournal})
            setReportData(data.getReportJournal);
            console.log("pancho 2")
            // setErrors([]) 
        }
    });

    const [ selectPointSale, { selectPointSaleLoading }] = useMutation(GET_POINT_SALE_USER,{
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        variables: { codigo: user?.codigo},
        onCompleted: (data) => {
            setPointSaleData(data.getPointSaleById);
            console.log("pancho 3")
            // setIsLoggeIn(false);
            setProductoSeleccionado({
                punto_venta: 0,
                fecha_inicio: '',
                fecha_fin: ''
            });
            setErrors([]) 
        }
    });


    /** LLENAMOS LAS LISTA DE VALORES */
    const defaultPropsPointSale = {
        options: pointSaleData,
        getOptionLabel: (option) => option.nombre,
    };

    React.useEffect(() => {
        if(user === null) {navigate('/');}
        console.log("pancho 1")
        selectPointSale();
    }, [])
    
    const closeSnackBars = () => {
        console.log("pancho 4")
        setMostrarSnackBar({
            mensaje: "",
            esError: true,
            mostrar: false
        });
    }

    return (
    <ThemeProvider theme={theme}>
    {errors?.map(function(error){
            return(
                <Alert severity="error">
                {error}
            </Alert>
        )
    })}
        <Container spacing={2} maxWidth="lg">

        {mostrarSnackBar.mostrar && (
            <SimpleSnackbar onClose={closeSnackBars} objeto={mostrarSnackBar} />
        )}
        
        { isLoggeIn === true ?
            <MyTitle titulo={'Reporte'}></MyTitle>
        : <div></div> }  
        
            <Grid container direction="row"  spacing={4} align="center" sx={{ borderBottom: "1px solid grey" }}>
                { isLoggeIn === true ?
                        <Grid item xs={3}>
                            <Item >
                                <Autocomplete
                                    {...defaultPropsPointSale}
                                    id="punto_venta"
                                    name="punto_venta"
                                    clearOnEscape
                                    
                                    onChange={(event, newValue) => {
                                        if(newValue !== null ){
                                            setProductoSeleccionado(prevState=>({
                                                ...prevState,
                                                "punto_venta": newValue.codigo
                                            }));
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Seleccione punto venta" />
                                        )}
                                        />
                            </Item>
                        </Grid>
                : <div></div> }   
                { isLoggeIn === true ?  
                        <Grid item xs={3}>
                            <Item >
                                <TextField
                                    fullWidth
                                    type="date"
                                    InputLabelProps={{
                                    shrink: true,
                                    }}
                                    name="fecha_inicio" 
                                    label="Fecha Inicio" 
                                    onChange={handleChange}
                                /> 
                            </Item>

                        </Grid>
                : <div></div> }   
                { isLoggeIn === true ?  
                        <Grid item xs={3}>
                            <Item >
                                <TextField
                                    fullWidth
                                    InputLabelProps={{
                                    shrink: true,
                                    }}
                                    type="date"
                                    name="fecha_fin" 
                                    label="Fecha Finalización" 
                                    onChange={handleChange}
                                /> 
                            </Item>

                        </Grid>
                : <div></div> }
                { isLoggeIn === true ?  
                        <Grid item xs={3} >
                            <Item style={{ flex: 1, justifyContent: 'center', alignItems:"center", lineHeight:"57px" }}>
                                <Button variant="contained" onClick={getReport} color="success">Buscar</Button>
                            </Item>
                        </Grid>
                : <div></div> }   
            </Grid>
        { isLoggeIn === true ?  
            reportData.length === 0 ? "" : <SpanningTable datos={reportData}></SpanningTable>
        : <div></div> } 
        </Container>
            
    </ThemeProvider>
    )
    
}

export default Report;
