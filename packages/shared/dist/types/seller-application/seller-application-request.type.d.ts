export interface CreateSellerApplicationRequest {
    shopName: string;
    businessAddress: string;
    returnAddress?: string;
}
export interface RejectSellerApplicationRequest {
    rejectReason: string;
}
