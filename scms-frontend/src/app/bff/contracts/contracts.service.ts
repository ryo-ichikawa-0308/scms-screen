import { Injectable } from '@angular/core';
import { PaginatedResponse, ContractDetail } from 'src/app/models/api.model';

/**
 * APIサービス (モック実装)
 */
@Injectable({ providedIn: 'root' })
export class ContractsService {
    // ダミーデータ
    private contracts: ContractDetail[] = Array.from({ length: 20 }, (_, i) => ({
        id: String(1000 + i + 1),
        name: `契約サービス C-${i + 1}`,
        userServicesId: String(1000 + i + 1),
        usersName: `契約サービス C-${i + 1}提供者`,
        price: 5000,
        unit: '個',
        quantity: Math.floor(Math.random() * 3) + 1,
    }));

    // モックAPIコール: 契約処理
    executeContract(serviceId: string, quantity: number): Promise<boolean> {
        return new Promise(resolve => {
            setTimeout(() => {
                // 成功をシミュレート
                const success = Math.random() > 0.1;
                if (success) {
                    console.log(`契約成功: サービスID ${serviceId}, 数量 ${quantity}`);
                }
                resolve(success);
            }, 1500); // 処理に時間がかかることをシミュレート
        });
    }

    // モックAPIコール: ページングされた契約一覧
    getContractList(query: string, pageIndex: number, pageSize: number): Promise<PaginatedResponse<ContractDetail>> {
        return new Promise(resolve => {
            setTimeout(() => {
                const filtered = this.contracts.filter(c => c.name || ''.toLowerCase().includes(query.toLowerCase()));
                const start = pageIndex * pageSize;
                const end = start + pageSize;
                const data = filtered.slice(start, end);

                resolve({
                    totalRecords: filtered.length,
                    totalPages: Math.ceil(filtered.length / pageSize),
                    currentPage: pageIndex,
                    offset: start,
                    limit: pageSize,
                    data: data,
                });
            }, 500);
        });
    }

    // モックAPIコール: 契約詳細
    getContractDetail(id: string): Promise<ContractDetail | undefined> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.contracts.find(c => c.id === id));
            }, 500);
        });
    }

    // モックAPIコール: 解約処理
    executeCancellation(contractId: string): Promise<boolean> {
        return new Promise(resolve => {
            setTimeout(() => {
                const success = Math.random() > 0.1;
                if (success) {
                    console.log(`解約成功: 契約ID ${contractId}`);
                }
                resolve(success);
            }, 1500);
        });
    }
}