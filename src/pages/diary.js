import {AuthContext } from '../context/authContext'
import { useContext, useState } from "react";
import { Alert, Autocomplete, Box, Button, Container, Grid, Modal, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material"

import * as React from 'react';
import Divider from '@mui/material/Divider';

import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import {makeStyles} from "@mui/styles";
import SpanningTable from '../components/tableDiary';
import { styleModal, Item } from '../components/modal';
import { useMutation } from '@apollo/react-hooks';
import { CREATE_JOURNAL, CREATE_JOURNAL_DETAIL, GET_JOURNAL_DETAIL_FOR_DAY, GET_POINT_SALE_USER } from '../gql/mutation';
import MyTitle from '../components/title';
import { Delete, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const theme = createTheme();
const useStyles = makeStyles((theme) => (styleModal));

function Diary(){
    let navigate = useNavigate();
    const context = useContext(AuthContext);
    const classes = useStyles();
    const [ errors, setErrors ] = useState([]);
    const [ pointSaleData, setPointSaleData ] = useState([]);
    const [ pointSaleSelected, setPointSaleSelected ] = useState(null);
    const [ productPointSale, setProductPointSale ] = useState([]);
    const [ journalDetailForDay, setJournalDetailForDay ] = useState([]);
    const [ journal, setJournal ] = useState([]);
    const [ journalDetail, setJournalDetail ] = useState([]);
    const [ productSeleccionado, setProductoSeleccionado ] = useState({
        cantidad: '',
        descripcion: '',
        producto: ''
    });
    const [ isLoggeIn, setIsLoggeIn ] = useState(false);
    const [ modalCreate, setModalCreate ] = useState(false);
    const { user, logout} = useContext(AuthContext);
     
    
    const handleChange = e => {
        const {name, value } = e.target;
        setProductoSeleccionado(prevState => ({
            ...prevState,
            [name]: value
        }))
    };

    const funCreateDetail = () => {
        createDetail();
        // setProductoSeleccionado({});
    }

    const openCloseModalCreate=()=>{
        setModalCreate(!modalCreate);
        console.log('redireccionar')
    }

    const loadingDataPointSale = () => {
        setIsLoggeIn(!isLoggeIn)
        const newArray = pointSaleData.find((datos) => datos.codigo === pointSaleSelected.codigo)
        setProductPointSale(newArray);
        createJournal();
        listJournalDetailForDay();
        setModalCreate(!modalCreate);
    }

    const funSelectPointSale = () => {
        selectPointSale();   
    }
    /*****MUTATION */
console.log(productSeleccionado)
    const [ createDetail, { createDetailLoading }] = useMutation(CREATE_JOURNAL_DETAIL, {
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        variables: {
            codigo_dia: journal.codigo_dia,
            codigo_producto: productSeleccionado.producto,
            cantidad: parseFloat(productSeleccionado.cantidad),
            cantidad_personas: 1,
            descripcion: productSeleccionado.descripcion
        },
        onCompleted: (data) => {
            const newCreate = data.createJournalDetail;
            const newProducto = productPointSale.productos;
            const newValue = newProducto.filter( (valor) => valor.codigo_punto_venta === newCreate.codigo_producto);
            setJournalDetailForDay(journalDetailForDay.concat({
                "codigo_producto": newCreate.codigo_producto,
                "nombre_producto": newValue[0].nombre,
                "cantidad": newCreate.cantidad,
                "descripcion": newCreate.descripcion,
                "precio": newValue[0].precio,
                "tipo_producto": newValue[0].tipo_producto,
                "__typename": "JournalDetailForDay"
            }))
        }
    })

    const [ selectPointSale, { selectPointSaleLoading }] = useMutation(GET_POINT_SALE_USER,{
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        variables: { codigo: user?.codigo},
        onCompleted: (data) => {
            setPointSaleData(data.getPointSaleById);
 
            setIsLoggeIn(false);
            setJournalDetailForDay([]);
            setProductoSeleccionado({
                cantidad: '',
                descripcion: '',
                producto: ''
            });
            setJournal([]);
            setProductPointSale([]);
            setErrors([]) 
            setModalCreate(true);
        }
    })

    /*Obtenemos el listado de registro realizados por el usuario */ 
    const [ listJournalDetailForDay, { listJournalDetailForDayLoading }] =useMutation(GET_JOURNAL_DETAIL_FOR_DAY,{
        onError({graphQLErrors}){
            setErrors(graphQLErrors);
        },
        variables: { codigo: pointSaleSelected?.codigo},
        onCompleted: (data) => {
            setJournalDetailForDay(data.getJournalDetailForDay);
        }
    });

    const [ createJournal, { dayLoading }] = useMutation(CREATE_JOURNAL,{
        onError({graphQLErrors}){
            setErrors(graphQLErrors);
        },
        variables: { codigo: pointSaleSelected?.codigo},
        onCompleted: (data) => {
            setJournal(data.createJournal)
        }
    });
    
    console.log({error: selectPointSaleLoading})
    /** LLENAMOS LAS LISTA DE VALORES */
    const defaultPropsPointSale = {
        options: pointSaleData,
        getOptionLabel: (option) => option.nombre,
    };

    const defaultPropsProduct = {
        options: productPointSale.productos ? productPointSale.productos : {"codigo": 0,
            "codigo_punto_venta": 0,
            "descripcion": "",
            "nombre": "",
            "precio": 0},
        getOptionLabel: (option) => option.nombre,
    };

 
    const bodyCreate=(
        <div className={classes.modal}>
            <h3>Seleccione Punto de venta</h3>
 
            <Autocomplete
                {...defaultPropsPointSale}
                id="punto_venta"
                name="punto_venta"
                clearOnEscape
                value={pointSaleSelected}
                onChange={(event, newValueC) => {
                    if(newValueC !== null){
                        setPointSaleSelected(newValueC);    
                        
                        setProductoSeleccionado(prevState=>({
                            ...prevState,
                            "punto_venta": newValueC.codigo
                        }));
                    }
                }}
                renderInput={(params) => (
                    <TextField {...params} label="Punto de venta" />
                    )}
                    />
            <br/>
            <br/>
            <div align="right">
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="contained" onClick={openCloseModalCreate} color="error">Cerrar</Button>
                    <Button variant="contained" onClick={loadingDataPointSale} color="primary">Seleccionar</Button>
                </Stack>
                {errors?.map(function(error){
                    return(
                        <Alert severity="error">
                        {error}
                    </Alert>
                )
            })}
            </div>
        </div>
        
    )

    React.useEffect(() => {
        if(user === null) {navigate('/');}
        funSelectPointSale();
    }, [])
    
    const onChangeInput = () => {
        setErrors(["Funcionalidad en desarrollo"])
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
        { isLoggeIn === true ?
        
            <MyTitle titulo={'Registro diario de ' +productPointSale.nombre}></MyTitle>
        : <div></div> }  
        
            <Grid container direction="row" justifyContent="center" alignItems="stretch" spacing={1}>
        { isLoggeIn === true ?
                <Grid item xs={2}>
                    <Item style={{ height: 80 }} >
                        <TextField 
                            type="number" 
                            inputProps={{ step: '0' }}
                            name="cantidad" 
                            label="Cantidad" 
                            onChange={handleChange}
                            value={ productSeleccionado.cantidad ? productSeleccionado.cantidad : 1}
                            /> 
                    </Item>
                </Grid>
        : <div></div> }  
        { isLoggeIn === true ?
                <Grid item xs={4}>
                    <Item style={{ height: 80 }}>
                        <Autocomplete
                            {...defaultPropsProduct}
                            id="productoo"
                            name="producto"
                            clearOnEscape
                            
                            onChange={(event, newValue) => {
                                if(newValue !== null ){
                                    setProductoSeleccionado(prevState=>({
                                        ...prevState,
                                        "producto": newValue.codigo_punto_venta
                                    }));
                                }
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Seleccione un producto" />
                                )}
                                />
                    </Item>
                </Grid>
        : <div></div> }   
        { isLoggeIn === true ?  
                <Grid item xs={4}>
                    <Item style={{ height: 80 }}>
                        <TextField multiline={true}
                        fullWidth
                            type="text"
                            name="descripcion" 
                            label="Descripcion" 
                            helperText="Descripción si es otros ingresos u otros egresos."
                            onChange={handleChange}
                            /> 
                    </Item>

                </Grid>
        : <div></div> }   
        { isLoggeIn === true ?  
                <Grid item xs="auto">
                    <Item style={{ height: 80, alignItems: "center", display: "flex"}}>
                        <Button variant="contained" onClick={funCreateDetail} color="success">Agregar</Button>
                    </Item>
                </Grid>
        : <div></div> }   
            </Grid>
        { isLoggeIn === true ?  
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>No.</TableCell>
                            <TableCell>Nombre Producto</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Cantidad</TableCell>
                            <TableCell>Egreso / Ingreso</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {journalDetailForDay
                        .map((console, index)=>(
                            <TableRow key={index+1}>
                                <TableCell>{ index+1 }</TableCell>
                                <TableCell>{console.nombre_producto}</TableCell>
                                <TableCell>{console.descripcion}</TableCell>
                                <TableCell>{console.cantidad}</TableCell>
                                <TableCell>{console.tipo_producto == true ? "Ingreso" : "Egreso"}</TableCell>
                                <TableCell>{console.cantidad * console.precio}</TableCell>
                                <TableCell>
                                    <Edit className="{styles.iconos}"  onClick={ () => onChangeInput()} />
                                    &nbsp;&nbsp;&nbsp;
                                    <Delete className="{styles.iconos}" onClick={ () => onChangeInput()} />        
                                </TableCell>
                            
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        : <div></div> } 
        </Container>

        <Modal
            open={modalCreate}
            onClose={openCloseModalCreate}>
            {bodyCreate}
        </Modal>
            
    </ThemeProvider>
    )
    
}

export default Diary;
