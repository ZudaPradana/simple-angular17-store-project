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
import { InputCreateSchema } from '../../pages/shared/models/Item';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private apollo: Apollo) {}

  getAllOrder(page: number, size: number): Observable<GetAllData> {
    return this.apollo
      .query<{ getAllOrder: GetAllData }>({
        query: gql`
          query GetAllOrder($page: Int!, $size: Int!) {
            getAllOrder(page: $page, size: $size) {
              header {
                code
                status
                message
              }
              data {
                orderId
                orderCode
                orderDate
                totalPrice
                quantity
                customers {
                  customerId
                  customerName
                }
                items {
                  itemId
                  itemName
                }
              }
            }
          }
        `,
        variables: {
          page: page,
          size: size,
        },
      })
      .pipe(map((result) => result.data.getAllOrder));
  }
}
