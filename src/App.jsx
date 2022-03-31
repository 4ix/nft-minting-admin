import React,{useState} from 'react';
import caver from './klaytn/caver';
import * as config from './config';
import * as addresses from './addresses';

const DEPLOYED_ADDRESS = config.DEPLOYED_ADDRESS; // 컨트랙트 주소
const DEPLOYED_ABI = config.DEPLOYED_ABI; // 컨트랙트 ABI
const ADDRESS = addresses.addresses; // 화이트리스트 로딩
const ADDRESS_ADD = addresses.addresses_add; // 화이트리스트 추가용

const App = () => {
  const contract = new caver.klay.Contract(DEPLOYED_ABI, DEPLOYED_ADDRESS); //컨트랙트 정보 불러오기
  const kip17 = new caver.kct.kip17(DEPLOYED_ADDRESS);

  let [account, setAccount] = useState(""); //지갑 주소
  let holders = [];
  let firstHolders = [];
  let addresses = [];

  const setAccountInfo = async () => {
    const { klaytn } = window;
    if (klaytn === undefined) return;
    await new Promise((resolve, reject) => setTimeout(resolve, 500));

    setAccount(await klaytn.selectedAddress);
  };

  const loadAccountInfo = async (e) => {
    const { klaytn } = window;
    if (klaytn) {
      try {
        await klaytn.enable();
        setAccountInfo(klaytn);
        klaytn.on("accountsChanged", () => setAccountInfo(klaytn));
      } catch (error) {
        console.log("User denied account access");
      }
    } else {
      console.log(
        "Non-Kaikas browser detected. You should consider trying Kaikas!",
      );
      alert("카이카스 월렛이 설치되어 있지 않습니다.");
    }
  };

  const addWhitelist = () => {
    // 화이트리스트 등록 컨트랙트 콜
    console.log(ADDRESS)
    contract.methods
      .setWhiteList(ADDRESS)
      .send({
        from: account,
        gas: 30000000,
      })
      .on('transactionHash', (transactionHash) => {
        console.log('txHash', transactionHash);
      })
      .on('receipt', (receipt) => {
        console.log('receipt', receipt);
      })
      .on('error', (error) => {
        console.log('error', error);
      })
      .then(async () => {
        alert('화이트리스트 등록에 성공하였습니다.');
      });
  };

  const loadTokenOwner = async () => {
    // 토큰 id 별 오너 월렛 주소 찾는 함수 (조회할 당시의 현황 체크, 조회 중 없는 토큰 아이디가 있으면 해당 번호에서 에러남)
    for (var i = 1; i <= Number(await kip17.totalSupply()); i++) {
        holders.push(await kip17.ownerOf(i))
        console.log(i)     
        }
        console.log(holders)
  };

  const loadFirstHolders = async () => {
    // 첫번째 홀더 조회하는 함수 
    for (var i = 1; i <= Number(await kip17.totalSupply()); i++) {
      firstHolders.push(await contract.methods.firstHolders(i).call())
      console.log(i)     
      }
      console.log(firstHolders)
  };

  const checkAddresses = async () => {
    // 지갑 주소 유효성 체크 함수
    for (var i = 0; i < ADDRESS.length; i++) {
      addresses.push(await caver.utils.isAddress(ADDRESS[i]))
      }
      console.log(addresses)
  };

  const selectWhitelist = () => {
    // 지갑 주소 배열 추가 함수
    var merged = ADDRESS.concat(ADDRESS_ADD); //기존 지갑주소에서 추가
    var unique = merged.filter((item, pos) => merged.indexOf(item) === pos);
    unique.sort(()=> Math.random()-0.5); // 생성된 배열 랜덤하게 정렬
    // console.log(unique) 
    let filtered = unique.filter(item => !ADDRESS.includes(item)); // 중복된 값 제거
    filtered.sort(()=> Math.random()-0.5); // 생성된 배열 랜덤하게 정렬
    console.log(filtered)
  }

  const setDeposit = () => {
    // 디파짓 실행 콜
    console.log(ADDRESS)
    contract.methods
      .deposit(ADDRESS)
      .send({
        from: account,
        gas: 30000000,
        value: 1000000000000000000,
      })
      .on('transactionHash', (transactionHash) => {
        console.log('txHash', transactionHash);
      })
      .on('receipt', (receipt) => {
        console.log('receipt', receipt);
      })
      .on('error', (error) => {
        console.log('error', error);
      })
      .then(async () => {
        alert('디파짓 분배에 성공하였습니다.');
      });
  };

  return (
    <div>
      
      {account}
      <br></br>
      <button 
        onClick={(e) => {
          loadAccountInfo();
        }}
      >지갑 연결</button>
      <br></br>
      <h5>지갑연결 해야함</h5>
      <button 
        onClick={(e) => {
          addWhitelist();
        }}
      >화이트리스트 등록</button>

      <br></br>
      <h5>지갑연결 안해도 됨</h5>
      <button 
        onClick={(e) => {
          loadTokenOwner();
        }}
      >토큰 오너 확인</button>
      <br></br>
      <button 
        onClick={(e) => {
          loadFirstHolders();
        }}
      >첫번째 홀더 확인</button>
      <br></br>
      <button 
        onClick={(e) => {
          checkAddresses();
        }}
      >지갑주소 유효성 체크</button>
      <br></br>
      <button 
        onClick={(e) => {
          selectWhitelist();
        }}
      >지갑주소 배열 추가(중복제외)</button>
      <br></br>
      <h5>최초 홀더 분배 관련</h5>
      <button 
        onClick={(e) => {
          setDeposit();
        }}
      >컨트랙트 입금 및 할당(월 1회 실행)</button>
    </div>
    
  );
};

export default App;
