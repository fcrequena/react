import { gql } from 'graphql-tag';

export const GET_ALL_PRODUCT = gql`
    query AllProduct{
        getAllProduct{ codigo nombre descripcion activo tipo_producto}
    }
`
export const GET_ALL_TYPE_PRODUCT = gql`
    query AllTypeProduct{
        getAllTypeProduct{ codigo nombre descripcion activo}
    }
`
export const GET_PRODUCT_BYID = gql`
    query Product ($codigo: Int!) {  
        getProductById(codigo: $codigo){ codigo nombre descripcion activo tipo_producto}
    }
`

export const GET_ALL_POINT_SALE = gql`
query AllPointSale{
    getAllPointSale{ codigo nombre descripcion activo cantidad
        productos{codigo nombre descripcion precio}}
}
`