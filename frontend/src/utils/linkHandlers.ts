export function openExplorerLink(tx:string, options?: {txType?: string, cluster?: string, clusterUrl?: string}){
    const {txType='tx',cluster='custom',clusterUrl='http://localhost:8899'} = options ?? {}
    const url = new URL(`https://explorer.solana.com/${txType}/${tx}`)
    url.searchParams.append("cluster",cluster)
    if(clusterUrl){
        url.searchParams.append("customUrl",clusterUrl)
    }
    window.open(url, '_blank');
}