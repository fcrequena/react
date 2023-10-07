import { useContext, useState } from "react";
import {AuthContext } from '../context/authContext'
import { useMutation, useQuery } from "@apollo/react-hooks";

import { TextField, Button, Container, Stack, Alert,
            Table, TableContainer, TableHead, TableCell, TableBody, TableRow, Tab,
            Modal, Autocomplete, Typography
    } from "@mui/material";

import { ThemeProvider, createTheme } from '@mui/material/styles';
import {makeStyles} from "@mui/styles";
import {Edit, Delete, CheckBox } from '@mui/icons-material';

import { gql } from 'graphql-tag';
import { createRoutesFromChildren, useNavigate } from "react-router-dom";

import { CREATE_PRODUCT, EDIT_PRODUCT, DELETE_PRODUCT } from "../gql/mutation";
import { GET_ALL_PRODUCT, GET_ALL_TYPE_PRODUCT, GET_PRODUCT_BYID } from "../gql/query";

import MyTitle from "../components/title";
/* CONSULTAS DE GRAPHQL */
const theme = createTheme();


/* ESTILOS MODAL */
const useStyles = makeStyles((theme) => ({
    modal: {
      position: 'absolute',
      width: 400,
      backgroundColor: '#ffffff',
      border: '2px solid #000',
      boxShadow: '15px 15px #888888',
      padding: '15px 20px 25px 15px',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    },
    iconos:{
        cursor: 'pointer'
    },
    inputMaterial:{       
        width:'100%'
    }
}));


function Product(props){

    const context = useContext(AuthContext)
    const classes = useStyles();
    let navigate = useNavigate();
    const [ errors, setErrors] = useState([]);
    const [ title, setTitle ] = useState("Producto")
    const [ productData, setProductData ] = useState([]);
    const [ typeProductData, setTypeProductData ] = useState([]);
    const [ modalCreate, setModalCreate ] = useState(false);
    const [ modalEdit, setModalEdit ] = useState(false);
    const [ modalDelete, setModalDelete ] = useState(false);
    const [ productoSeleccionado, setProductoSeleccionado ] = useState({
        nombre: '',
        descripcion: '',
        tipo_producto: null
    })
    const [ tipoSeleccionado, setTipoSeleccionado ] = useState(null);

    const handleChange = e => {
        const { name, value } = e.target;
        setProductoSeleccionado(prevState=>({
            ...prevState,
            [name]: value
        }))
    }
    //---------------------------------------------
    const {loading, error, data} = useQuery(GET_ALL_PRODUCT,{
        onCompleted: (queryData) =>{
            const productArray = queryData.getAllProduct;
            setProductData(productArray);
        }
    });

    const {typeLoading, typeError, typeData} = useQuery(GET_ALL_TYPE_PRODUCT,{
        onCompleted: (queryData) =>{
            const productArray = queryData.getAllTypeProduct;
            setTypeProductData(productArray);
        }
    });
    //Mutaciones ------------------------------------------------------------------------
    function funCreateProducto()
    {
        createProducto();           
    }

    const [createProducto, { createLoading }] = useMutation(CREATE_PRODUCT,{
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        variables: {nombre: productoSeleccionado.nombre, 
                    descripcion: productoSeleccionado.descripcion, 
                    tipo_producto: productoSeleccionado.tipo_producto} ,
        onCompleted: (data) => {
            setProductData(productData.concat(data.createProduct));
            openCloseModalCreate();
        }
    });

    function funEditProducto()
    {
        editProducto();           
    }

    const [editProducto, { editLoading }] = useMutation(EDIT_PRODUCT,{
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        variables: {codigo: productoSeleccionado.codigo,
                    nombre: productoSeleccionado.nombre, 
                    descripcion: productoSeleccionado.descripcion, 
                    tipo_producto: productoSeleccionado.tipo_producto} ,
        onCompleted: (data) => {
                var newData = [...productData];
                var editado = data.updateProduct;
                    newData.map(array => { 
                        
                        if( array.codigo !== editado.codigo ){
                            return array;
                        }
                    })
                    var indiceAEliminar = newData.findIndex((valor) => valor.codigo === editado.codigo);
                    const nuevoArray = [...newData.slice(0, indiceAEliminar), ...newData.slice(indiceAEliminar + 1)];
                    setProductData(nuevoArray.concat(editado));
                //setProductData(nuevoArray);
                openCloseModalEdit();
        }
    });


    function funDeleteProducto()
    {
        deleteProducto();           
    }

    const [deleteProducto, { deleteLoading }] = useMutation(DELETE_PRODUCT,{
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        variables: {codigo: productoSeleccionado.codigo} ,
        onCompleted: (data) => {
            console.log(data);
                var newData = [...productData];
                var editado = data.deleteProductById;
                    newData.map(array => { 
                        
                        if( array.codigo !== editado.codigo ){
                            return array;
                        }
                    })
                    var indiceAEliminar = newData.findIndex((valor) => valor.codigo === editado.codigo);
                    const nuevoArray = [...newData.slice(0, indiceAEliminar), ...newData.slice(indiceAEliminar + 1)];

                    //setProductData(nuevoArray.concat(editado));
                    setProductData(nuevoArray);
                openCloseModalDelete();
        }
    });

    if (loading) return null;
    if (error) {
        let isArray = Array.isArray(error);
        if(!isArray){
            navigate('/');
            return;
        }
        setErrors(error);
    }

    //Modales--------------------------------------------------------------------------
    const openCloseModalCreate=()=>{
        setModalCreate(!modalCreate);
    }

    const openCloseModalEdit=()=>{
        setTipoSeleccionado(null);
        setModalEdit(!modalEdit);
    }

    const openCloseModalDelete=()=>{
        setTipoSeleccionado(null);
        setModalDelete(!modalDelete);
    }

    const seleccionarProducto=(producto, caso)=>{
        let tipo = typeProductData.find((valor)=> valor.codigo === producto.tipo_producto);
       
        setTipoSeleccionado(tipo);
        setProductoSeleccionado(producto);
        if (caso == 'Editar') {
            setModalEdit(true)
        }  else{
            setModalDelete(true)
        }
    }

    //--------------------------------------------------------
    const defaultProps = {
        options: typeProductData,
        getOptionLabel: (option) => option.nombre,
    };

    const bodyCreate=(
        <div className={classes.modal}>
            <h3>Crear {title}</h3>
            <TextField name="nombre" className={classes.inputMaterial} label="Nombre" onChange={handleChange}/> <br/>
            <br/>
            <TextField name="descripcion" className={classes.inputMaterial} label="Descripcion" onChange={handleChange}/> <br/>
            <br/>
            <Autocomplete
                {...defaultProps}
                id="tipo_producto"
                name="tipo_producto"
                clearOnEscape
                value={tipoSeleccionado}
                //onChange={handleChange}
                onChange={(event, newValue) => {
                    setTipoSeleccionado(newValue);
                    setProductoSeleccionado(prevState=>({
                        ...prevState,
                        "tipo_producto": newValue.codigo
                    }));
                }}
                renderInput={(params) => (
                    <TextField {...params} label="Tipo de producto" />
                )}
            />

            <br/>
            <br/>
            <div align="right">
                <Button onClick={funCreateProducto} color="primary">Crear</Button>
                <Button onClick={openCloseModalCreate}>Cerrar</Button>

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
            <h3>Editar {title}</h3>
            <TextField name="nombre" className={classes.inputMaterial} label="Nombre" onChange={handleChange} value={productoSeleccionado && productoSeleccionado.nombre}/> <br/>
            <br/>
            <TextField name="descripcion" className={classes.inputMaterial} label="Descripcion" onChange={handleChange} value={productoSeleccionado && productoSeleccionado.descripcion}/> <br/>
            <br/>
            <Autocomplete
                {...defaultProps}
                id="tipo_producto"
                name="tipo_producto"
                clearOnEscape
                value={tipoSeleccionado}
                onChange={(event, newValue) => {
                    setTipoSeleccionado(newValue);
                    setProductoSeleccionado(prevState=>({
                        ...prevState,
                        "tipo_producto": newValue.codigo
                    }));
                }}
                isOptionEqualToValue={(option, value) => option.codigo === value.codigo}
                renderInput={(params) => (
                    <TextField {...params} label="Tipo de producto" />
                )}
            />

            <br/>
            <br/>
            <div align="right">
                <Button onClick={funEditProducto} color="primary">Editar</Button>
                <Button onClick={openCloseModalEdit}>Cerrar</Button>
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

    const bodyDelete=(
        <div className={classes.modal}>
            <h3>Eliminar {title}</h3>
            <p>Está seguro de Eliminar este {title} " {productoSeleccionado && productoSeleccionado.nombre} "?</p>
            <div align="right">
                <Button onClick={funDeleteProducto} color="primary">Sí</Button>
                <Button onClick={openCloseModalDelete}>No</Button>
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

    const miBoton = (
        <Button variant="contained" color="success" onClick={openCloseModalCreate}>Nuevo</Button>
      );

    return (
    <ThemeProvider theme={theme}>
        <div>
        <Container spacing={4} maxWidth="md">
        <MyTitle titulo={title} boton={miBoton}></MyTitle>
            <br/>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productData.map(console=>(
                            <TableRow key={console.codigo}>
                                <TableCell>{console.nombre}</TableCell>
                                <TableCell>{console.descripcion}</TableCell>
                                <TableCell>{console.activo == true ? "Activo" : "Inactivo"}</TableCell>
                                <TableCell>
                                    <Edit className="{styles.iconos}" onClick={() => seleccionarProducto(console, 'Editar')} />
                                    &nbsp;&nbsp;&nbsp;
                                    <Delete className="{styles.iconos}" onClick={() => seleccionarProducto(console, 'Eliminar')} />        
                                </TableCell>
                            
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            </Container>
        
            <Modal
                open={modalCreate}
                onClose={openCloseModalCreate}>
                {bodyCreate}
            </Modal>

            <Modal
                open={modalEdit}
                onClose={openCloseModalEdit}>
                {bodyEdit}
            </Modal>
    
            <Modal
                open={modalDelete}
                onClose={openCloseModalDelete}>
                {bodyDelete}
            </Modal>

        </div>
    </ThemeProvider>
    )

}

export default Product;