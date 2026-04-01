public class Main {
    public static void main(String[] args) {
        Solution solu = new Solution();
        int[] nums = {2,3,5,2,6,2};
        int val = 2;
        int result = solu.removeElement(nums, val);
        System.out.println("剩余数量: "+result);
    }
}
class Solution {
        public int removeElement(int[] nums, int val) {
            int len = nums.length;
            if (len == 0){
                return  0;
            }
            int start = 0;
            int end = len -1;    
            while(start <= end) {
                 if(nums[start] != val) {
                    start = start + 1;
                 }
                 else {
                    while(start<end && nums[end]==val) {
                        end =end - 1;
                    }
                    if (start < end){
                        nums[start] = nums[end];
                        end = end - 1;
                    }
                 }
            }
            return start;
        }
}
