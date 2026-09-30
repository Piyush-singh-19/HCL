import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { RiskReport } from "../models/risk.model";
import { ApiResponse } from "../models/api-response.model";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class RiskService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/risk`;

  getRiskReport(): Observable<RiskReport> {
    return this.http.get<ApiResponse<RiskReport>>(`${this.apiUrl}/report`).pipe(
      map(res => res.data)
    );
  }
}
