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
import { CREATE_JOURNAL, CREATE_JOURNAL_DETAIL, DELETE_JOURNAL_DETAIL, EDIT_JOURNAL_DETAIL, GET_JOURNAL_DETAIL_FOR_DAY, GET_POINT_SALE_USER } from '../gql/mutation';
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
        cantidad: 1,
        descripcion: '',
        producto: ''
    });
    const [ isLoggeIn, setIsLoggeIn ] = useState(false);
    const [ modalCreate, setModalCreate ] = useState(false);
    const [ modalDelete, setModalDelete ] = useState(false);
    const [ modalEdit, setModalEdit ] = useState(false);

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

    const openCloseModalDelete=()=>{
        setModalDelete(!modalDelete);
    }
    const openCloseModalEdit=()=>{
        setModalEdit(!modalEdit);
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

    const funSeleccionarRegistro = (registro, accion) => {
        console.log({registro, accion});

        setProductoSeleccionado(registro);

        if(accion=== 'Eliminar'){
            setModalDelete(true);
        } else if(accion === 'Editar'){
            setModalEdit(true);
        }
    }

    const funEditJournal = () => {
        editDetail();
    }

    const funDeleteJournal = () => {
        console.log({journalDetailForDay})
        deleteDetail();
        console.log({
            codigo_detalle: productSeleccionado.codigo_detalle, 
            codigo_dia: journal.codigo_dia, 
            codigo_producto: productSeleccionado.codigo_producto
        })
    }

    /*****MUTATION */
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
                "codigo_detalle": newCreate.codigo,
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

    const [ deleteDetail, { deleteDetailLoading }] = useMutation(DELETE_JOURNAL_DETAIL, {
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        variables: {
            codigo_detalle: productSeleccionado.codigo_detalle, 
            codigo_dia: journal.codigo_dia
        },
        onCompleted: (data) => {
            var newData = [...journalDetailForDay];
            var editado = data.deleteJournalDetail;
                newData.map(array => { 
                    
                    if( array.codigo_detalle !== editado.codigo ){
                        return array;
                    }
                })
                var indiceAEliminar = newData.findIndex((valor) => valor.codigo_detalle === editado.codigo);
                const nuevoArray = [...newData.slice(0, indiceAEliminar), ...newData.slice(indiceAEliminar + 1)];
                setJournalDetailForDay(nuevoArray);
                openCloseModalDelete();
        }
    });

    const [ editDetail, { editDetailLoading }] = useMutation(EDIT_JOURNAL_DETAIL, {
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        variables: {
            codigo_detalle: productSeleccionado.codigo_detalle, 
            codigo_dia: journal.codigo_dia, 
            codigo_producto: parseFloat(productSeleccionado.codigo_producto),
            cantidad: parseFloat(productSeleccionado.cantidad),
            descripcion: productSeleccionado.descripcion
        },
        onCompleted: (data) => {
            var newData = [...journalDetailForDay];
            var editado = data.editJournalDetail;
            const newProducto = productPointSale.productos;
            const newValue = newProducto.filter( (valor) => valor.codigo_punto_venta === editado.codigo_producto);

            newData.map(array => { 
                
                if( array.codigo_detalle !== editado.codigo ){
                    return array;
                }
            })
            var indiceAEliminar = newData.findIndex((valor) => valor.codigo_detalle === editado.codigo);
            const nuevoArray = [...newData.slice(0, indiceAEliminar), ...newData.slice(indiceAEliminar + 1)];

            setJournalDetailForDay(nuevoArray.concat({
                "codigo_detalle": editado.codigo,
                "codigo_producto": editado.codigo_producto,
                "nombre_producto": newValue[0].nombre,
                "cantidad": editado.cantidad,
                "descripcion": editado.descripcion,
                "precio": newValue[0].precio,
                "tipo_producto": newValue[0].tipo_producto,
                "__typename": "JournalDetailForDay"
            }));
            openCloseModalEdit();
        }
    });

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
                cantidad: 1,
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


    const bodyDelete=(
        <div className={classes.modal}>
            <h3>Eliminacion de registro.</h3>
            <p> Esta seguro que desea eliminar el registro de "{productSeleccionado.nombre_producto}" con la cantidad de "{productSeleccionado.precio}" ?</p>
            <br/>
            <div align="right">
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="contained" onClick={openCloseModalDelete} color="secondary">Cerrar</Button>
                    <Button variant="contained" onClick={funDeleteJournal} color="error">Eliminar</Button>
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

    const bodyEdit=(
        <div className={classes.modal}>
            <h3>Editar el registro.</h3>
            <br/>
            <TextField 
                    fullWidth 
                    disabled 
                    label= "Producto"
                    value={productSeleccionado.nombre_producto}
                /> 
            <br/>
            <br/>
            <TextField 
                    fullWidth 
                    type='text'
                    name='descripcion'
                    label="Descripcion"
                    onChange={handleChange}
                    value={productSeleccionado.descripcion}
                /> 
            <br/>
            <br/>
            <TextField 
                fullWidth
                type="number" 
                inputProps={{ step: '0' }}
                name="cantidad" 
                label="Cantidad" 
                onChange={handleChange}
                value={ productSeleccionado.cantidad ? productSeleccionado.cantidad : 1}
            /> 
            <br/>
            <br/>
            <div align="right">
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="contained" onClick={openCloseModalEdit} color="secondary">Cerrar</Button>
                    <Button variant="contained" onClick={funEditJournal} color="primary">Editar</Button>
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
                        .sort((x, y) => x.codigo_detalle - y.codigo_detalle)
                        .map((console, index)=>(
                            <TableRow key={index+1}>
                                <TableCell>{ index+1 }</TableCell>
                                <TableCell>{console.nombre_producto}</TableCell>
                                <TableCell>{console.descripcion}</TableCell>
                                <TableCell>{console.cantidad}</TableCell>
                                <TableCell>{console.tipo_producto == true ? "Ingreso" : "Egreso"}</TableCell>
                                <TableCell>{console.cantidad * console.precio}</TableCell>
                                <TableCell>
                                    <Edit className="{styles.iconos}"  onClick={ () => funSeleccionarRegistro(console, 'Editar')} />
                                    &nbsp;&nbsp;&nbsp;
                                    <Delete className="{styles.iconos}" onClick={ () => funSeleccionarRegistro(console, 'Eliminar')} />        
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

        <Modal
            open={modalDelete}
            onClose={openCloseModalDelete}>
            {bodyDelete}
        </Modal>

        <Modal
            open={modalEdit}
            onClose={openCloseModalEdit}>
            {bodyEdit}
        </Modal>
            
    </ThemeProvider>
    )
    
}

export default Diary;
