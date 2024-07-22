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
export class ItemService {
  constructor(private apollo: Apollo) {}

  getAllItem(page: number, size: number): Observable<GetAllData> {
    return this.apollo
      .query<{ getAllItem: GetAllData }>({
        query: gql`
          query GetAllItem($page: Int!, $size: Int!) {
            getAllItem(page: $page, size: $size) {
              header {
                code
                status
                message
              }
              data {
                itemId
                itemName
                price
                stock
                isAvailable
              }
            }
          }
        `,
        variables: {
          page: page,
          size: size,
        },
      })
      .pipe(map((result) => result.data.getAllItem));
  }
}
