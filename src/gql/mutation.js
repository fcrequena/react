import { gql } from 'graphql-tag';

export const CREATE_PRODUCT = gql`
    mutation mutation ($nombre: String!, $descripcion: String!, $tipo_producto: Int!){
createProduct(
	nombre:$nombre,
	descripcion:$descripcion, 
	activo:true,  
	tipo_producto:$tipo_producto
){codigo nombre descripcion activo tipo_producto}}`

export const EDIT_PRODUCT = gql`
    mutation mutation ($codigo: Int!, $nombre: String!, $descripcion: String!, $tipo_producto: Int!){
updateProduct(
    codigo: $codigo,
	nombre: $nombre,
	descripcion: $descripcion, 
	activo: true,  
	tipo_producto: $tipo_producto
){codigo nombre descripcion activo tipo_producto}}`

export const DELETE_PRODUCT = gql`
    mutation mutation ($codigo: Int!){
deleteProductById(
    codigo: $codigo
){codigo nombre descripcion activo tipo_producto}}`


export const CREATE_TYPE_PRODUCT = gql`
    mutation mutation ($nombre: String!, $descripcion: String!){
createTypeProduct(
	nombre:$nombre,
	descripcion:$descripcion, 
	activo:true,  
	es_producto: true
){codigo nombre descripcion activo es_producto }}`

export const EDIT_TYPE_PRODUCT = gql`
    mutation mutation ($codigo: Int!, $nombre: String!, $descripcion: String!){
updateTypeProduct(
	codigo: $codigo
	nombre: $nombre
	descripcion:$descripcion, 
	activo:true,  
	es_producto: true
){codigo nombre descripcion activo es_producto }}`

export const DELETE_TYPE_PRODUCT = gql`
    mutation mutation ($codigo: Int!){
        deleteTypeProductById(codigo: $codigo){
	codigo
	nombre
	descripcion
	activo
	es_producto	 
}}`


export const CREATE_POINT_SALE = gql`
    mutation mutation ($nombre: String!, $descripcion: String!){
createPointSale(
	nombre:$nombre,
	descripcion:$descripcion, 
	activo:true,
    cantidad: 1
){codigo nombre descripcion activo
	productos{codigo nombre descripcion precio}
}}`

export const EDIT_POINT_SALE = gql`
    mutation mutation ($codigo: Int!, $nombre: String!, $descripcion: String!){
updatePointSale(
    codigo: $codigo,
	nombre: $nombre,
	descripcion: $descripcion, 
	activo: true,  
    cantidad: 1
){codigo nombre descripcion activo
	productos{codigo nombre descripcion precio}
}}`

export const DELETE_POINT_SALE = gql`
    mutation mutation ($codigo: Int!){
deletePointSaleById(
    codigo: $codigo
){codigo nombre descripcion activo}}`

export const CREATE_POINT_PRODUCTO = gql`
mutation mutation ($codigo_producto: Int!, $codigo_punto_venta: Int!, $precio: Float!){
	createProductPointSale(producto: $codigo_producto,
							punto_venta:$codigo_punto_venta,
							precio: $precio,
							activo: true){
		codigo producto punto_venta precio
	}
}`