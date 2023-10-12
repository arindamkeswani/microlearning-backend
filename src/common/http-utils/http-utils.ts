import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { HttpException, Injectable } from '@nestjs/common';

// @Injectable()
export class HttpUtilService {
  httpService = new HttpService();
  constructor() { }

  request<T = any>(config: AxiosRequestConfig<any>) {
    return new Promise((resolve, reject) => {
      this.httpService.request(config).subscribe({
        next(res) {
          resolve(res.data);
        },
        error(err) {
          reject(err);
        },
      });
    });
  }

  get(url, params, headers) {
    const options: AxiosRequestConfig = {
      url: url,
      params,
      headers,
    };

    return new Promise((resolve, reject) => {
      this.httpService
        .get(url, options)
        .pipe(map((response) => response.data))
        .subscribe({
          // Handled Pagination case for GET method, so “next” resolution is different from other methods. Business data is one level lower from other methods
          next: (data) => resolve({ data: data.data, paginate: (data.paginate ? data.paginate : null)}),
          error: (error) => {
            if (error.response && error.response.data) {
              const err = error.response;
              //reject(new HttpException(err?.message, status));
              console.log("GET ERROR", err.data);
              err.isError = true;
              resolve(err);
            } else {
              //connection error
              //reject(new HttpException(error?.message, 500));
              console.log(error?.message);
              error.isError = true;
              resolve(error);
            }
          },
        });
    });
  }

  post(url, data, headers) {
    const options: AxiosRequestConfig = {
      headers,
    };
    return new Promise((resolve, reject) => {
      this.httpService
        .post(url, data, options)
        .pipe(map((response) => response.data))
        .subscribe({
          next: (data) => resolve(data),
          error: (error) => {
            if (error.response && error.response.data) {
              // const { error: err } = error.response.data;
              let err = error.response;
              //reject(new HttpException(err?.message, status));
              console.log(error?.message);
              err.isError = true;
              resolve(err);

            } else {
              //connection error
              //reject(new HttpException(error?.message, 500));
              console.log(error?.message);
              error.isError = true;
              resolve(error);
            }
          },
        });
    });
  }

  patch(url, data, headers) {
    const options: AxiosRequestConfig = {
      headers,
    };
    return new Promise((resolve, reject) => {
      this.httpService
        .patch(url, data, options)
        .pipe(map((response) => response.data))
        .subscribe({
          next: (data) => resolve(data.data),
          error: (error) => {
            if (error.response && error.response.data) {
              let err = error.response;
              //reject(new HttpException(err.message, status));
              console.log(err?.message);     
              err.isError = true;
              resolve(err);
            } else {
              //connection error
              // reject(new HttpException(error?.message, 500));
              console.log(error?.message);
              error.isError = true;
              resolve(error);
            }
          },
        });
    });
  }

  put(url, data, headers) {
    const options: AxiosRequestConfig = {
      headers,
    };
    return new Promise((resolve, reject) => {
      this.httpService
        .put(url, data, options)
        .pipe(map((response) => response.data))
        .subscribe({
          next: (data) => resolve(data.data),
          error: (error) => {
            if (error.response && error.response.data) {
              let err = error.response;
              //reject(new HttpException(err.message, status));
              console.log(err?.message);
              err.isError = true;
              resolve(err);
            } else {
              //connection error
              //reject(new HttpException(error?.message, 500));
              console.log(error?.message);
              error.isError = true;
              resolve(error);
            }
          },
        });
    });
  }

  delete(url, headers) {
    const options: AxiosRequestConfig = {
      headers,
    };

    return new Promise((resolve, reject) => {
      this.httpService
        .delete(url, options)
        .pipe(map((response) => response.data))
        .subscribe({
          next: (data) => resolve(data.data),
          error: (error) => {
            if (error.response && error.response.data) {
              let err = error.response;
              //reject(new HttpException(err.message, status));
              console.log(err?.message);
              err.isError = true;
              resolve(err);
            } else {
              //connection error
              //reject(new HttpException(error?.message, 500));
              console.log(error?.message);
              error.isError = true;
              resolve(error);
            }
          },
        });
    });
  }
}
