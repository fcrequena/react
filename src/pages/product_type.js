import { useContext, useState } from "react";
import {AuthContext } from '../context/authContext'

import { useMutation, useQuery } from "@apollo/react-hooks";

import { TextField, Button, Container, Stack, Alert,
            Table, TableContainer, TableHead, TableCell, TableBody, TableRow, Tab,
            Modal, TablePagination
    } from "@mui/material";

import { ThemeProvider, createTheme } from '@mui/material/styles';
import {makeStyles} from "@mui/styles";
import {Edit, Delete } from '@mui/icons-material';

import { gql } from 'graphql-tag';
import { useNavigate } from "react-router-dom";

import { GET_ALL_PRODUCT, GET_ALL_TYPE_PRODUCT, GET_PRODUCT_BYID } from "../gql/query";
import {CREATE_TYPE_PRODUCT, EDIT_TYPE_PRODUCT, DELETE_TYPE_PRODUCT } from '../gql/mutation'
import MyTitle from "../components/title";
import { styleModal } from "../components/modal";
import SimpleSnackbar from "../components/snackbars";
/* CONSULTAS DE GRAPHQL */
const theme = createTheme();

/* ESTILOS MODAL */
const useStyles = makeStyles((theme) => (styleModal));

function TypeProduct(props){

    const context = useContext(AuthContext)
    const classes = useStyles();
    let navigate = useNavigate();

    const [ errors, setErrors] = useState([]);
    const [ title, setTitle ] = useState("Tipo de producto")
    const [ productData, setProductData ] = useState([]);
    const [ typeProductData, setTypeProductData ] = useState([]);
    const [ modalCreate, setModalCreate ] = useState(false);
    const [ modalEdit, setModalEdit ] = useState(false);
    const [ modalDelete, setModalDelete ] = useState(false);
    const [ productoSeleccionado, setProductoSeleccionado ] = useState({
        nombre: '',
        descripcion: ''
    })

    const [filtro, setFiltro] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [isChecked, setIsChecked] = useState(false);
    const [ tipoSeleccionado, setTipoSeleccionado ] = useState(null);

    const [ mostrarSnackBar, setMostrarSnackBar ] = useState({
        mensaje: " -- inicio ===",
        esError: false,
        mostrar: false
    });
    
    const closeSnackBars = () => {
        setMostrarSnackBar({
            mensaje: "",
            esError: true,
            mostrar: false
        });
    }

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
    function funCreateTypeProducto()
    {   
        const { nombre, descripcion} = productoSeleccionado;
        
        if(nombre === undefined || nombre === ""){
            setMostrarSnackBar({
                mensaje: "Ingrese el nombre del producto.",
                esError: true,
                mostrar: true
            });
            return;
        }
        
        if(descripcion === undefined || descripcion === ""){
            setMostrarSnackBar({
                mensaje: "Ingrese la descripcion del producto.",
                esError: true,
                mostrar: true
            });
            return;
        }

        createTypeProducto();           
    }

    const [createTypeProducto, { createLoading }] = useMutation(CREATE_TYPE_PRODUCT,{
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        variables: {nombre: productoSeleccionado.nombre, 
                    descripcion: productoSeleccionado.descripcion} ,
        onCompleted: (data) => {
            setTypeProductData(typeProductData.concat(data.createTypeProduct));
            setMostrarSnackBar({
                mensaje: "Registro creado con exito.",
                esError: false,
                mostrar: true
            });
            openCloseModalCreate();
        }
    });

    function funEditTypeProducto()
    {
        const { nombre, descripcion} = productoSeleccionado;
        if(nombre === undefined || nombre === ""){
            setMostrarSnackBar({
                mensaje: "Ingrese el nombre del producto.",
                esError: true,
                mostrar: true
            });
            return;
        }
        
        if(descripcion === undefined || descripcion === ""){
            setMostrarSnackBar({
                mensaje: "Ingrese la descripcion del producto.",
                esError: true,
                mostrar: true
            });
            return;
        }
        editTypeProducto();           
    }

    const [editTypeProducto, { editLoading }] = useMutation(EDIT_TYPE_PRODUCT,{
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        variables: {codigo: productoSeleccionado.codigo,
                    nombre: productoSeleccionado.nombre, 
                    descripcion: productoSeleccionado.descripcion} ,
        onCompleted: (data) => {
            var newData = [...typeProductData];
            var editado = data.updateTypeProduct;

                    newData.map(array => { 
                        
                        if( array.codigo !== editado.codigo ){
                            return array;
                        }
                    })
                    var indiceAEliminar = newData.findIndex((valor) => valor.codigo === editado.codigo);
                    const nuevoArray = [...newData.slice(0, indiceAEliminar), ...newData.slice(indiceAEliminar + 1)];
                    setTypeProductData(nuevoArray.concat(editado));
                    setMostrarSnackBar({
                        mensaje: "Registro actualizado con exito.",
                        esError: false,
                        mostrar: true
                    });
                openCloseModalEdit();
        }
    });


    function funDeleteTypeProducto()
    {
        deleteTypeProducto();           
    }

    const [deleteTypeProducto, { deleteLoading }] = useMutation(DELETE_TYPE_PRODUCT,{
        onError({ graphQLErrors }){
            setErrors(graphQLErrors);
        },
        variables: {codigo: productoSeleccionado.codigo} ,
        onCompleted: (data) => {

                var newData = [...typeProductData];
                var editado = data.deleteTypeProductById;
                    newData.map(array => { 
                        
                        if( array.codigo !== editado.codigo ){
                            return array;
                        }
                    })
                    var indiceAEliminar = newData.findIndex((valor) => valor.codigo === editado.codigo);
                    const nuevoArray = [...newData.slice(0, indiceAEliminar), ...newData.slice(indiceAEliminar + 1)];

                    setTypeProductData(nuevoArray.concat(editado));
                    setMostrarSnackBar({
                        mensaje: "Registro eliminado con exito.",
                        esError: false,
                        mostrar: true
                    });
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
        setErrors([]);
        setModalCreate(!modalCreate);
    }

    const openCloseModalEdit=()=>{
        setErrors([]);
        setTipoSeleccionado(null);
        setModalEdit(!modalEdit);
    }

    const openCloseModalDelete=()=>{
        setErrors([]);
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
    const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

    const bodyCreate=(
        <div className={classes.modal}>
            <h3>Crear {title}</h3>
            <TextField name="nombre" className={classes.inputMaterial} label="Nombre" onChange={handleChange}/> <br/>
            <br/>
            <TextField name="descripcion" className={classes.inputMaterial} label="Descripcion" onChange={handleChange}/> <br/>
            <br/>
            <br/>
            <div align="right">
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="contained" onClick={openCloseModalCreate} color="error">Cerrar</Button>
                    <Button variant="contained" onClick={funCreateTypeProducto} color="primary">Crear</Button>
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
            <h3>Editar {title}</h3>
            <TextField name="nombre" className={classes.inputMaterial} label="Nombre" onChange={handleChange} value={productoSeleccionado && productoSeleccionado.nombre}/> <br/>
            <br/>
            <TextField name="descripcion" className={classes.inputMaterial} label="Descripcion" onChange={handleChange} value={productoSeleccionado && productoSeleccionado.descripcion}/> <br/>
            <br/>
            <br/>
            <div align="right">
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="contained" onClick={openCloseModalEdit} color="error">Cerrar</Button>
                    <Button variant="contained" onClick={funEditTypeProducto} color="primary">Editar</Button>
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

    const bodyDelete=(
        <div className={classes.modal}>
            <h3>Eliminar {title}</h3>
            <p>Está seguro de Eliminar este producto {productoSeleccionado && productoSeleccionado.nombre}?</p>
            <div align="right">
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="contained" onClick={funDeleteTypeProducto} color="primary">Sí</Button>
                    <Button variant="contained" onClick={openCloseModalDelete}>No</Button>
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


    /**FUNCION DE LA TABLA-------------------------------------------------------------- */
   
    // Función para manejar cambios en el campo de búsqueda
    const handleFiltroChange = (event) => {
        setFiltro(event.target.value);
    };
    
    // Filtrar los datos basados en el filtro de búsqueda
    const datosFiltrados = typeProductData.filter((dato) =>
        dato.nombre.toLowerCase().includes(filtro.toLowerCase())
    );
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
      };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    /**mis BOTONES -------------------------------------------------------------------- */
    const miBoton = (
        <Button  variant="contained" color="success" onClick={openCloseModalCreate}>Nuevo</Button>
      );
    
    const miFiltro = (
        <TextField label="Buscar por nombre" value={filtro} onChange={handleFiltroChange} />
    );

      return (
    <ThemeProvider theme={theme}>
    {errors?.map(function(error){
        return(
        <Alert severity="error"> {error} </Alert>
        )
    })}
        <div>
        <Container spacing={4} maxWidth="md">
        {mostrarSnackBar.mostrar && (
            <SimpleSnackbar onClose={closeSnackBars} objeto={mostrarSnackBar} />
        )}
        <MyTitle titulo={title} boton={miBoton} buscar={miFiltro}   ></MyTitle> 
            <br/>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Producto / Servicio</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {datosFiltrados
                        .sort((x, y) => x.codigo - y.codigo)
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map(console=>(
                            <TableRow key={console.codigo}>
                                <TableCell>{console.nombre}</TableCell>
                                <TableCell>{console.descripcion}</TableCell>
                                <TableCell>{console.es_producto == true ? "Producto" : "Servicio"}</TableCell>
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
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 100]}
                component="div"
                count={datosFiltrados.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
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

export default TypeProduct;