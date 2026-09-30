import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { TechnicalAnalysis } from "../models/analysis.model";
import { ApiResponse } from "../models/api-response.model";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AnalysisService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/analysis`;

  getTechnicalAnalysis(symbol: string): Observable<TechnicalAnalysis> {
    return this.http.get<ApiResponse<TechnicalAnalysis>>(`${this.apiUrl}/${symbol}`).pipe(
      map(res => {
        const data = res.data;
        if (data && data.history) {
          data.history = data.history.map(item => ({
            ...item,
            date: item.date || item.formattedDate || (item.timestamp ? item.timestamp.substring(0, 10) : '')
          }));
        }
        return data;
      })
    );
  }
}
