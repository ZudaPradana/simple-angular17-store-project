import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map, catchError } from 'rxjs/operators';
import {
  HeaderResponse,
  GetAllData,
  GetData,
} from '../../pages/shared/models/Employee';
import { InputCreateSchema } from '../../pages/shared/models/Employee';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(private apollo: Apollo) {}

  getAllCustomers(page: number, size: number): Observable<GetAllData> {
    return this.apollo
      .query<{ getAllCustomer: GetAllData }>({
        query: gql`
          query GetAllCustomer($page: Int!, $size: Int!) {
            getAllCustomer(page: $page, size: $size) {
              header {
                code
                status
                message
              }
              data {
                customerId
                customerName
                customerAddress
                customerPhone
                isActive
              }
            }
          }
        `,
        variables: {
          page: page,
          size: size,
        },
      })
      .pipe(map((result) => result.data.getAllCustomer));
  }

  getCustomerById(customerId: string): Observable<GetData> {
    console.log('Querying for customer ID:', customerId); // Log the customer ID
    return this.apollo
      .query<{ getCustomerById: GetData }>({
        query: gql`
          query GetCustomerById($customerId: ID!) {
            # Change the type to ID!
            getCustomerById(customerId: $customerId) {
              header {
                code
                status
                message
              }
              data {
                customerId
                customerName
                customerAddress
                customerCode
                customerPhone
                isActive
                lastOrderDate
                pic
              }
            }
          }
        `,
        variables: { customerId },
      })
      .pipe(
        map((result) => {
          console.log('Apollo query result:', result); // Log the Apollo query result
          return result.data.getCustomerById;
        })
      );
  }

  createCustomer(customerData: InputCreateSchema): Observable<HeaderResponse> {
    return this.apollo
      .mutate<{ createCustomer: HeaderResponse }>({
        mutation: gql`
          mutation CreateCustomer(
            $createCustomer: RequestCustomerUpdateCreate!
          ) {
            createCustomer(createCustomer: $createCustomer) {
              code
              status
              message
            }
          }
        `,
        variables: {
          createCustomer: customerData,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data || !result.data.createCustomer) {
            throw new Error('CreateCustomer response is undefined');
          }
          return result.data.createCustomer;
        }),
        catchError((error) => {
          console.error('Apollo error:', error);
          throw error; // Rethrow error to catch it in the subscription
        })
      );
  }

  updateCustomer(
    id: string,
    customerData: InputCreateSchema
  ): Observable<HeaderResponse> {
    return this.apollo
      .mutate<{ updateCustomer: HeaderResponse }>({
        mutation: gql`
          mutation UpdateCustomer(
            $id: String!
            $updateCustomer: CreateCustomerInput!
          ) {
            updateCustomer(id: $id, updateCustomer: $updateCustomer) {
              code
              status
              message
            }
          }
        `,
        variables: {
          id: id,
          updateCustomer: customerData,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data || !result.data.updateCustomer) {
            throw new Error('UpdateCustomer response is undefined');
          }
          return result.data.updateCustomer;
        })
      );
  }

  // Metode untuk menghapus customer
  deleteCustomer(id: string): Observable<HeaderResponse> {
    return this.apollo
      .mutate<{ deleteCustomer: HeaderResponse }>({
        mutation: gql`
          mutation DeleteCustomer($id: String!) {
            deleteCustomer(id: $id) {
              code
              status
              message
            }
          }
        `,
        variables: {
          id: id,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data || !result.data.deleteCustomer) {
            throw new Error('DeleteCustomer response is undefined');
          }
          return result.data.deleteCustomer;
        })
      );
  }
}
